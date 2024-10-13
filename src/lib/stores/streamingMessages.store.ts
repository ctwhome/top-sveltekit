import { get, writable } from 'svelte/store';
import { chatStore } from './chat.store';

type Message = {
  id?: string;
  chat_id: string;
  sender: string;
  content: string;
  sent_at?: string;
}

export const messages = writable([]);
export const currentStreamedMessage = writable({ openai: '', claude: '', gemini: '' });
export const isStreaming = writable({ openai: false, claude: false, gemini: false });
let abortControllers: { openai: AbortController | null, claude: AbortController | null, gemini: AbortController | null } = { openai: null, claude: null, gemini: null };

export async function loadChatMessages(chatId: string | null = get(chatStore).currentChatId) {
  try {
    const response = await fetch(`/api/messages?chat_id=${chatId}`);
    messages.set(await response.json());
  } catch (error) {
    console.error('Error loading chat:', error.message);
  }
};

export function cleanUpMessages() {
  messages.set([]);
}

function addMessageToStore(message: Message): Message {
  messages.update(state => [...state, message]);
  return message;
}

async function updateMessageInDatabase(message: Message) {
  try {
    const response = await fetch(`/api/messages/${message.id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(message)
    });

    if (!response.ok) {
      throw new Error('Failed to update message in database');
    }
  } catch (error) {
    console.error('Error updating message in database:', error);
  }
}

export async function addMessage(message: Message, openAIEnabled: boolean, claudeEnabled: boolean, geminiEnabled: boolean) {
  const userMessage = addMessageToStore(message);

  const streamPromises = [];

  if (openAIEnabled) {
    streamPromises.push(streamResponse('openai', userMessage));
  }

  if (claudeEnabled) {
    streamPromises.push(streamResponse('claude', userMessage));
  }

  if (geminiEnabled) {
    streamPromises.push(streamResponse('gemini', userMessage));
  }

  await Promise.all(streamPromises);
}

async function streamResponse(api: 'openai' | 'claude' | 'gemini', message: Message) {
  abortControllers[api] = new AbortController();
  isStreaming.update(s => ({ ...s, [api]: true }));
  currentStreamedMessage.update(msg => ({ ...msg, [api]: '' }));

  try {
    // Ensure content is a non-empty string
    const content = typeof message.content === 'string' && message.content.trim() !== '' ? message.content : 'Empty message';

    const res = await fetch(`/api/${api}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ ...message, content }),
      signal: abortControllers[api].signal
    });

    if (res.ok) {
      const reader = res.body.getReader();
      const decoder = new TextDecoder();

      let streamedContent = '';
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value);
        streamedContent += chunk;
        currentStreamedMessage.update(msg => ({ ...msg, [api]: streamedContent }));
      }

      // Add the final streamed message to the messages store
      addMessageToStore({
        chat_id: message.chat_id,
        content: streamedContent,
        sender: api,
        sent_at: new Date().toISOString()
      });

      // Clear the streamed message
      currentStreamedMessage.update(msg => ({ ...msg, [api]: '' }));
    } else {
      console.error(`Failed to get ${api} response. Status: ${res.status}`);
      const errorBody = await res.text();
      console.error(`Error details: ${errorBody}`);
    }
  } catch (error) {
    if (error.name === 'AbortError') {
      console.log(`${api} message streaming was aborted`);
      // Add the partially streamed message to the messages store
      const partialContent = get(currentStreamedMessage)[api];
      if (partialContent) {
        addMessageToStore({
          chat_id: message.chat_id,
          content: partialContent + ' ...',
          sender: api,
          sent_at: new Date().toISOString()
        });
      }
      // Clear the streamed message
      currentStreamedMessage.update(msg => ({ ...msg, [api]: '' }));
    } else {
      console.error(`Error adding message and getting ${api} response:`, error);
      console.error(`Error details:`, error.message);
      if (error.response) {
        console.error(`Response status:`, error.response.status);
        console.error(`Response data:`, error.response.data);
      }
    }
  } finally {
    isStreaming.update(s => ({ ...s, [api]: false }));
    abortControllers[api] = null;
  }
}

export function stopMessageStreaming(api: 'openai' | 'claude' | 'gemini' | 'all') {
  if (api === 'all') {
    Object.keys(abortControllers).forEach(key => {
      if (abortControllers[key]) {
        abortControllers[key].abort();
        isStreaming.update(s => ({ ...s, [key]: false }));
        abortControllers[key] = null;
      }
    });
  } else if (abortControllers[api]) {
    abortControllers[api].abort();
    isStreaming.update(s => ({ ...s, [api]: false }));
    abortControllers[api] = null;
  }
}

import { writable, get } from 'svelte/store';
import type { Message } from './types';
import { chatStore } from './chatStore';

// Store for the current streaming message
export const streamingMessagesStore = writable<Message | null>(null);

export function updateStreamingMessage(provider: 'openai' | 'claude' | 'gemini', content: string) {
  streamingMessagesStore.update(message => {
    if (message) {
      const updatedMessage = {
        ...message,
        answers: {
          ...message.answers,
          [provider]: (message.answers?.[provider] || '') + content
        }
      };
      console.log('Updated streaming message:', updatedMessage);
      return updatedMessage;
    }
    return message;
  });

  chatStore.update(state => {
    if (!Array.isArray(state.messages)) {
      state.messages = [];
    }
    const updatedMessages = [...state.messages];
    const lastMessage = updatedMessages[updatedMessages.length - 1];
    if (lastMessage) {
      updatedMessages[updatedMessages.length - 1] = {
        ...lastMessage,
        answers: {
          ...lastMessage.answers,
          [provider]: (lastMessage.answers?.[provider] || '') + content
        }
      };
    }
    const updatedState = {
      ...state,
      messages: updatedMessages
    };
    console.log('Updated chatStore state:', updatedState);
    return updatedState;
  });
}

export function finalizeStreamingMessage() {
  const streamingMessage = get(streamingMessagesStore);
  console.log('Finalizing streaming message:', streamingMessage);

  if (streamingMessage) {
    chatStore.update(state => {
      if (!Array.isArray(state.messages)) {
        state.messages = [];
      }
      const updatedMessages = [...state.messages];
      updatedMessages[updatedMessages.length - 1] = streamingMessage;
      const updatedState = {
        ...state,
        messages: updatedMessages
      };
      console.log('Final chatStore state:', updatedState);
      return updatedState;
    });
  }

  // Reset streaming message store
  streamingMessagesStore.set(null);
}
import { writable, get } from 'svelte/store';
import type { Chat, Message } from './types';
import { page } from '$app/stores';
import { addChat } from '../chatList.store';
import { streamingMessagesStore, updateStreamingMessage, finalizeStreamingMessage } from './streamingStore';
import { streamFromAllProviders } from './api';
import { summarizeSentence } from './utils';

export const chatStore = writable<Chat>({} as Chat);

export function cleanChat() {
  chatStore.set({} as Chat);
  streamingMessagesStore.set(null);
}

export async function loadChat(chatId: string | null) {
  cleanChat();

  if (!chatId) {
    console.error('No chatId provided to loadChat');
    return;
  }

  try {
    const response = await fetch(`/api/chats/chat?chatId=${chatId}`);
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
    }
    const data = await response.json();
    if (!data.messages || !Array.isArray(data.messages)) {
      throw new Error('Invalid data format received from server');
    }
    chatStore.set(data);
  } catch (error) {
    console.error('Error fetching chat:', error.message);
    // You might want to show an error message to the user here
  }
}

export async function addMessage(message: Message, chatId: string) {
  console.log('Adding new message:', message);

  const newMessage = {
    ...message,
    answers: {
      openai: '',
      claude: '',
      gemini: ''
    }
  };

  chatStore.update(state => {
    const updatedState = {
      ...state,
      messages: Array.isArray(state.messages) ? [...state.messages, newMessage] : [newMessage]
    };
    console.log('Updated chatStore state:', updatedState);
    return updatedState;
  });

  streamingMessagesStore.set(newMessage);

  // Start streaming responses from all providers
  await streamFromAllProviders(message.user);

  // Get the updated chat with AI responses
  const updatedChat = get(chatStore);
  console.log('Updated chat before saving to database:', updatedChat);

  // Save the entire updated chat to the database
  try {
    const res = await fetch('/api/chats/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ chat: updatedChat, chatId: chatId })
    });

    if (!res.ok) {
      const errorData = await res.json();
      throw new Error(errorData.message || `HTTP error! status: ${res.status}`);
    }

    console.log('Chat successfully saved to database');
  } catch (error) {
    console.error('Failed to save chat to database:', error);
  }
}

export async function createNewChat(content: string) {
  const newChat = {
    user_id: get(page).data.session.user.id,
    title: summarizeSentence(content),
    started_at: new Date().toISOString(),
    messages: [] // Initialize messages as an empty array
  };

  const res = await fetch('/api/chats/createChat', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(newChat)
  });

  if (res.ok) {
    const [{ id }] = await res.json();
    const chatWithId = { ...newChat, id };
    addChat(chatWithId);
    chatStore.set(chatWithId); // Set the new chat in the chatStore
    return id;
  } else {
    console.error('Failed to create new chat');
    return null;
  }
}
import { get, writable } from 'svelte/store';
import { goto } from '$app/navigation';
import type { Chat } from './chat.store';


export const chatListStore = writable<Chat[]>([]);

export function addChat(chat: Chat) {
  chatListStore.update(state => ([chat, ...state]));
}

export async function archiveChat(chatId: string) {
  chatListStore.update(state => (
    state.filter((chat) => chat.id !== chatId)
  ));

  goto('/chat');

  const res = await fetch('/api/chats/archiveChat', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ chatId })
  });

  if (!res.ok) {
    console.error('Failed to archive chat');
  }
}

export async function cleanChats() {
  chatListStore.set([]);
}


export async function loadChats() {
  try {
    const response = await fetch('/api/chats/getChats');
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const data = await response.json();
    // set the chats in the store
    chatListStore.set(data);


  } catch (error) {
    console.error('Error in loadChats:', error);
  }
}
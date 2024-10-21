import { writable } from 'svelte/store';

export const powersyncStore = writable([]);

export const initializePowersync = async () => {
  try {
    const response = await fetch('/api/powersync/init');
    const data = await response.json();
    powersyncStore.set(data);
  } catch (error) {
    console.error('Error initializing powersync:', error);
  }
};

export const syncWithPowersync = async () => {
  try {
    const response = await fetch('/api/powersync/sync');
    const data = await response.json();
    powersyncStore.set(data);
  } catch (error) {
    console.error('Error syncing with powersync:', error);
  }
};

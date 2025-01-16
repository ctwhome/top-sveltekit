import './index.css';
import { createStore, ValueOrUndefined, Cell } from 'tinybase';
import { createIndexedDbPersister } from 'tinybase/persisters/persister-indexed-db';

// Convenience function for attaching an action to a button
const onClick = (id: string, onClick: () => void) =>
  document.getElementById(id)!.addEventListener('click', onClick);

// Convenience function for writing out pretty JSON into an element
const updateJson = (id: string, content: any) =>
  (document.getElementById(id)!.innerText = JSON.stringify(content, null, 2));

// Convenience function for generating a random integer
const getRandom = (max = 100) => Math.floor(Math.random() * max);

// WebSocket connection for remote sync
let ws: WebSocket | null = null;
let isOnline = navigator.onLine;
let isSyncUpdate = false;

interface SyncMessage {
  type: 'init' | 'update';
  data: {
    tables?: Record<string, Record<string, Record<string, Cell>>>;
    values?: Record<string, ValueOrUndefined>;
  };
}

// Function to create and setup WebSocket connection
const setupWebSocket = (store: ReturnType<typeof createStore>) => {
  if (ws) ws.close();

  ws = new WebSocket('ws://localhost:3001');

  ws.onopen = () => {
    console.log('Connected to sync server');
    isOnline = true;
    const status = document.getElementById('syncStatus');
    if (status) {
      status.dataset.status = 'online';
      status.textContent = 'Online';
    }
  };

  ws.onclose = () => {
    console.log('Disconnected from sync server');
    isOnline = false;
    const status = document.getElementById('syncStatus');
    if (status) {
      status.dataset.status = 'offline';
      status.textContent = 'Offline';
    }
    // Try to reconnect after 5 seconds
    setTimeout(() => {
      if (!isOnline) setupWebSocket(store);
    }, 5000);
  };

  ws.onmessage = (event) => {
    try {
      const { type, data } = JSON.parse(event.data) as SyncMessage;

      if (type === 'init' || type === 'update') {
        // Update local store with remote changes
        isSyncUpdate = true;
        try {
          if (data.tables) {
            Object.entries(data.tables).forEach(([tableId, table]) => {
              store.setTable(tableId, table);
            });
          }
          if (data.values) {
            Object.entries(data.values).forEach(([valueId, value]) => {
              if (value !== undefined) {
                store.setValue(valueId, value);
              }
            });
          }
        } finally {
          isSyncUpdate = false;
        }
      }
    } catch (error) {
      console.error('Error processing message:', error);
    }
  };

  return ws;
};

// Initialize store and persistence
const initializeStore = async () => {
  const store = createStore();

  try {
    // Create a persister with auto-sync capabilities
    const persister = createIndexedDbPersister(
      store,
      'my-app-db',
      undefined, // Don't poll for changes, we'll handle saves manually
      (error: Error) => console.error('IndexedDB error:', error)
    );

    // First, try to load any existing data
    console.log('Loading persisted data...');
    await persister.load();
    console.log('Initial data loaded:', store.getTables());

    // We'll handle saves manually, no auto-sync needed

    // Create sync status indicator
    const header = document.querySelector('header');
    const syncStatus = document.createElement('div');
    syncStatus.id = 'syncStatus';
    syncStatus.dataset.status = 'offline';
    syncStatus.textContent = 'Offline';
    header?.appendChild(syncStatus);

    // If store is empty, initialize with default data
    if (Object.keys(store.getTables()).length === 0) {
      console.log('Initializing with default data...');
      store
        .setValue('counter', 0)
        .setRow('pets', '0', { name: 'fido', species: 'dog' })
        .setTable('species', {
          dog: { price: 5 },
          cat: { price: 4 },
          fish: { price: 2 },
          worm: { price: 1 },
          parrot: { price: 3 },
        });
    }

    // Set up UI only after data is loaded/initialized
    setupUI(store, persister);

    // Setup WebSocket connection
    setupWebSocket(store);

    // Handle online/offline events
    window.addEventListener('online', () => {
      isOnline = true;
      setupWebSocket(store);
    });

    window.addEventListener('offline', () => {
      isOnline = false;
      const status = document.getElementById('syncStatus');
      if (status) {
        status.dataset.status = 'offline';
        status.textContent = 'Offline';
      }
    });

  } catch (error) {
    console.error('Error initializing store:', error);
  }
};

// Setup UI elements and listeners
const setupUI = (
  store: ReturnType<typeof createStore>,
  persister: ReturnType<typeof createIndexedDbPersister>
) => {
  // Attach events to the buttons
  onClick('countButton', () =>
    store.setValue(
      'counter',
      (value: ValueOrUndefined) => ((value ?? 0) as number) + 1
    )
  );

  onClick('randomButton', () => store.setValue('random', getRandom()));

  onClick('addPetButton', () =>
    store.addRow('pets', {
      name: ['fido', 'felix', 'bubbles', 'lowly', 'polly'][getRandom(5)],
      species: store.getRowIds('species')[getRandom(5)],
    })
  );

  // Set up store listeners for UI updates and syncing
  const handleStoreChange = () => {
    updateJson('tablesJson', store.getTables());
    updateJson('valuesJson', store.getValues());

    // Only sync and persist if this wasn't triggered by a sync update
    if (!isSyncUpdate) {
      // First sync to server if online
      if (ws?.readyState === WebSocket.OPEN) {
        ws.send(JSON.stringify({
          type: 'update',
          data: {
            tables: store.getTables(),
            values: store.getValues()
          }
        }));
      }

      // Then save to IndexedDB
      persister.save().catch((error: Error) => console.error('Error saving:', error));
    }
  };

  store.addTablesListener(handleStoreChange);
  store.addValuesListener(handleStoreChange);

  // Initial UI update
  updateJson('valuesJson', store.getValues());
  updateJson('tablesJson', store.getTables());
};

// Start initialization when page loads
addEventListener('load', () => {
  initializeStore().catch(console.error);
});

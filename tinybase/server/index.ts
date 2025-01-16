import { WebSocket, WebSocketServer } from 'ws';
import { createStore, Store, Id, Cell, Value } from 'tinybase';

interface SyncMessage {
  type: 'init' | 'update';
  data: {
    tables?: Record<string, Record<string, Record<string, Cell>>>;
    values?: Record<string, Value>;
  };
}

// Initialize WebSocket server on port 3001 (since 3000 might be used by Vite)
const wss = new WebSocketServer({ port: 3001 });
const store = createStore();

// Track connected clients
const clients = new Set<WebSocket>();

// Broadcast updates to all clients except the sender
const broadcast = (data: any, sender: WebSocket) => {
  clients.forEach(client => {
    if (client !== sender && client.readyState === WebSocket.OPEN) {
      client.send(JSON.stringify(data));
    }
  });
};

wss.on('connection', (ws: WebSocket) => {
  clients.add(ws);
  console.log('Client connected. Total clients:', clients.size);

  // Send initial store data to new client
  ws.send(JSON.stringify({
    type: 'init',
    data: {
      tables: store.getTables(),
      values: store.getValues()
    }
  }));

  ws.on('message', (message: string) => {
    try {
      const { type, data } = JSON.parse(message.toString()) as SyncMessage;

      switch (type) {
        case 'update':
          // Update server store
          if (data.tables) {
            Object.entries(data.tables).forEach(([tableId, table]) => {
              store.setTable(tableId, table);
            });
          }
          if (data.values) {
            Object.entries(data.values).forEach(([valueId, value]) => {
              store.setValue(valueId, value);
            });
          }

          // Broadcast to other clients
          broadcast({ type: 'update', data }, ws);
          break;
      }
    } catch (error) {
      console.error('Error processing message:', error);
    }
  });

  ws.on('close', () => {
    clients.delete(ws);
    console.log('Client disconnected. Total clients:', clients.size);
  });
});

console.log('TinyBase sync server running on ws://localhost:3001');

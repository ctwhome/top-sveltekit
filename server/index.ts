import { serve } from "bun";

// Mock data for todos
let todos = new Map([
  ['1', { id: '1', text: 'Learn ElectricSQL', completed: false }],
  ['2', { id: '2', text: 'Build a todo app', completed: false }]
]);

const server = serve({
  port: 3000,
  fetch(req) {
    // CORS headers
    const headers = new Headers({
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type",
    });

    // Handle preflight request
    if (req.method === "OPTIONS") {
      return new Response(null, { headers });
    }

    const url = new URL(req.url);

    if (url.pathname === '/v1/shape/todos' && req.method === 'GET') {
      const todosObject = Object.fromEntries(todos);

      console.log('🎹 todosObject', todosObject);

      headers.set("Content-Type", "application/json");

      return new Response(JSON.stringify(todosObject), { headers });
    } else {
      return new Response("Not Found", { status: 404, headers });
    }
  },
});

console.log(`Server running at http://localhost:${server.port}/`);

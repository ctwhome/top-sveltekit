let count = $state([]);

import { getDb } from '$lib/db/surreal';
import type { Uuid } from 'surrealdb';

async function fetchTodos() {
  const db = await getDb();
  const todos = await db.select('test');
  count.push(...todos);
}

fetchTodos();
console.log('🎹 count:', count);


console.log('🎹 hola');


// Call live query to update the count
let queryUuid: Uuid | undefined;

try {

  // const db = await getDb();
  // console.log('🎹 db:', db);
  // queryUuid = await db.live("todos", (action, result) => {
  //   console.log('🎹 action:', action);
  //   console.log('🎹 result:', result);
  //   switch (action) {
  //     case "CREATE":
  //     case "UPDATE":
  //       break;
  //     case "DELETE":
  //       break;
  //   }
  // });
} catch (error) {
  console.error('Error setting up live query:', error);
  throw error;
}


export function getCounter() {
  function increment() {
    // count += 1
  }
  function decrement() {
    // count -= 1
  }

  // console.log('test:', test)

  return {
    get count() {
      return count;
    },
    increment,
    decrement
  };
}
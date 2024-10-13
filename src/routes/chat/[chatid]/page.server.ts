// import { error } from '@sveltejs/kit';

// /** @type {import('./$types').PageServerLoad} */
// export function load({ params, fetch, locals }) {
//   const { chatid } = params;

//   const fetchMessages = async () => {
//     const response = await fetch(`/api/chats/chat?chatId=${chatid}`);
//     if (!response.ok) {
//       throw error(response.status, 'Failed to fetch messages');
//     }
//     return response.json();
//   };

//   return {
//     messages: fetchMessages(),
//     chatid: Promise.resolve(chatid)
//   };
// }
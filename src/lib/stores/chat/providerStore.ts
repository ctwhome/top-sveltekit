import { persisted } from 'svelte-persisted-store';

// Persisted stores for provider selection
export const openAIEnabled = persisted('openAIEnabled', true);
export const claudeEnabled = persisted('claudeEnabled', false);
export const geminiEnabled = persisted('geminiEnabled', false);
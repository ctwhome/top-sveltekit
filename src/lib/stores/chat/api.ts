import { get } from 'svelte/store';
import { openAIEnabled, claudeEnabled, geminiEnabled } from './providerStore';
import { updateStreamingMessage, finalizeStreamingMessage } from './streamingStore';

export async function streamFromAllProviders(message: string) {
  const providers = [
    { name: 'openai', enabled: get(openAIEnabled) },
    { name: 'claude', enabled: get(claudeEnabled) },
    { name: 'gemini', enabled: get(geminiEnabled) }
  ].filter(provider => provider.enabled);

  const fetchPromises = providers.map(provider =>
    fetch(`/api/${provider.name}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message, stream: true })
    })
  );

  const responses = await Promise.allSettled(fetchPromises);
  const readers = responses.map((response, index) => {
    if (response.status === 'fulfilled' && response.value.ok) {
      return response.value.body.getReader();
    } else {
      console.error(`Error from ${providers[index].name}:`, response.status === 'rejected' ? response.reason : response.value.statusText);
      return null;
    }
  });

  const decoders = providers.map(() => new TextDecoder());

  const timeout = 30000; // 30 seconds timeout
  const startTime = Date.now();

  while (true) {
    if (Date.now() - startTime > timeout) {
      console.error('Streaming timeout');
      break;
    }

    const results = await Promise.all(readers.map((reader, index) =>
      reader ? reader.read().then(result => ({ ...result, provider: providers[index].name })) : { done: true, provider: providers[index].name }
    ));

    let allDone = true;
    for (const { done, value, provider } of results) {
      if (!done) {
        allDone = false;
        const chunk = decoders[providers.findIndex(p => p.name === provider)].decode(value);
        updateStreamingMessage(provider, chunk);
      } else if (done && get(streamingMessagesStore)?.answers?.[provider] === '') {
        // If a provider is done but hasn't sent any data, update with an error message
        updateStreamingMessage(provider, 'Error: No response received from the provider.');
      }
    }

    if (allDone) break;
  }

  finalizeStreamingMessage();
}
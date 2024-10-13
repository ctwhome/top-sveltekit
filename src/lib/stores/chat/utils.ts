export function summarizeSentence(sentence: string, numWords = 3): string {
  const words = sentence.toLowerCase().match(/\b(\w+)\b/g);
  const stopWords = new Set([
    'the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of', 'with', 'by'
  ]);
  const filteredWords = words.filter((word) => !stopWords.has(word));
  const wordCounts = {};
  filteredWords.forEach((word) => {
    wordCounts[word] = (wordCounts[word] || 0) + 1;
  });
  const topWords = Object.entries(wordCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, numWords)
    .map((entry) => entry[0]);

  return topWords.join(' ');
}
import { KeywordClassifier, EmbeddingSimilarityClassifier, RouterFactory } from '../src/index.js';

// --- 1. Keyword Classifier ---
const keywordClassifier = new KeywordClassifier(
  [
    { label: 'book_flight', keywords: ['flight', 'fly', 'ticket', 'plane'] },
    { label: 'check_status', keywords: ['status', 'track', 'where'] },
    { label: 'cancel_booking', keywords: ['cancel', 'refund', 'delete'] },
  ],
  { name: 'flight-intents', priority: 1 }
);

// --- 2. Embedding Similarity Classifier ---
// In production you would call an embedding API. Here we use dummy vectors.
const embeddingClassifier = new EmbeddingSimilarityClassifier(
  [
    { label: 'positive', vector: [0.9, 0.1, 0.0] },
    { label: 'negative', vector: [-0.9, 0.1, 0.0] },
    { label: 'neutral', vector: [0.1, 0.1, 0.1] },
  ],
  {
    name: 'sentiment',
    priority: 2,
    embeddingProvider: (input: string): number[] => {
      // Dummy embedding based on input length
      const v = [0, 0, 0];
      for (let i = 0; i < input.length; i++) {
        v[i % 3] += input.charCodeAt(i) / 1000;
      }
      return v;
    },
  }
);

// --- 3. Router with built-in classifiers ---
const router = RouterFactory.create({
  routeThreshold: 0.5,
  fallbackThreshold: 0.1,
  clarificationEnabled: true,
});

router.registerClassifier(keywordClassifier);
router.registerClassifier(embeddingClassifier);

async function main(): Promise<void> {
  console.log('=== Keyword Classification ===');
  const inputs = [
    'I want to book a flight to Paris',
    'Can you check the status of my booking?',
    'I need to cancel my reservation',
  ];

  for (const input of inputs) {
    const decision = await router.process(input, 'flight-intents');
    console.log(`"${input}" → ${decision.type}${decision.target ? `: ${decision.target}` : ''}`);
  }

  console.log('\n=== Embedding Similarity Classification ===');
  const sentiments = ['This is absolutely wonderful!', 'I hate this product', 'It is what it is'];

  for (const input of sentiments) {
    const decision = await router.process(input, 'sentiment');
    console.log(`"${input}" → ${decision.type}${decision.target ? `: ${decision.target}` : ''}`);
  }
}

main().catch(console.error);

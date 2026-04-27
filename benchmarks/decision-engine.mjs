import { ConfidenceRouter, KeywordClassifier, EmbeddingSimilarityClassifier } from '../dist/index.js';

const ITERATIONS = 100_000;

// Benchmark 1: Core decision engine
{
  const router = new ConfidenceRouter({
    routeThreshold: 0.8,
    fallbackThreshold: 0.3,
    clarificationEnabled: true,
  });

  const classification = {
    predictions: [
      { label: 'book_flight', confidence: 0.85 },
      { label: 'check_status', confidence: 0.10 },
      { label: 'cancel_booking', confidence: 0.05 },
    ],
  };

  // Warmup
  for (let i = 0; i < 1000; i++) router.decide(classification);

  const start = performance.now();
  for (let i = 0; i < ITERATIONS; i++) {
    router.decide(classification);
  }
  const elapsed = performance.now() - start;

  console.log(`DecisionEngine: ${ITERATIONS} decisions in ${elapsed.toFixed(2)}ms`);
  console.log(`  → ${(ITERATIONS / (elapsed / 1000)).toFixed(0)} decisions/sec`);
  console.log(`  → ${(elapsed / ITERATIONS).toFixed(4)}ms per decision`);
}

// Benchmark 2: Keyword classifier
{
  const classifier = new KeywordClassifier([
    { label: 'book_flight', keywords: ['flight', 'fly', 'ticket', 'plane'] },
    { label: 'check_status', keywords: ['status', 'check', 'where', 'track'] },
    { label: 'cancel_booking', keywords: ['cancel', 'refund', 'delete'] },
  ]);

  const input = 'I want to book a flight to Paris';

  // Warmup
  for (let i = 0; i < 1000; i++) await classifier.classify(input);

  const start = performance.now();
  for (let i = 0; i < ITERATIONS; i++) {
    await classifier.classify(input);
  }
  const elapsed = performance.now() - start;

  console.log(`\nKeywordClassifier: ${ITERATIONS} classifications in ${elapsed.toFixed(2)}ms`);
  console.log(`  → ${(ITERATIONS / (elapsed / 1000)).toFixed(0)} classifications/sec`);
  console.log(`  → ${(elapsed / ITERATIONS).toFixed(4)}ms per classification`);
}

// Benchmark 3: Embedding similarity classifier
{
  const classifier = new EmbeddingSimilarityClassifier(
    [
      { label: 'positive', vector: [0.9, 0.1, 0.2] },
      { label: 'negative', vector: [-0.8, 0.3, 0.1] },
      { label: 'neutral', vector: [0.1, 0.1, 0.1] },
    ],
    {
      embeddingProvider: (text) => {
        const v = [0, 0, 0];
        for (let i = 0; i < text.length; i++) v[i % 3] += text.charCodeAt(i) / 1000;
        return v;
      },
    }
  );

  const input = 'This is absolutely wonderful!';

  // Warmup
  for (let i = 0; i < 1000; i++) await classifier.classify(input);

  const start = performance.now();
  for (let i = 0; i < ITERATIONS; i++) {
    await classifier.classify(input);
  }
  const elapsed = performance.now() - start;

  console.log(`\nEmbeddingSimilarityClassifier: ${ITERATIONS} classifications in ${elapsed.toFixed(2)}ms`);
  console.log(`  → ${(ITERATIONS / (elapsed / 1000)).toFixed(0)} classifications/sec`);
  console.log(`  → ${(elapsed / ITERATIONS).toFixed(4)}ms per classification`);
}

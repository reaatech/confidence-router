import { ConfidenceRouter } from '../src/index.js';
import type { Classifier, ClassificationResult } from '../src/index.js';

// A simple keyword-based classifier
const keywordClassifier: Classifier = {
  name: 'keyword-classifier',
  type: 'keyword',
  enabled: true,
  priority: 1,

  async classify(input: string): Promise<ClassificationResult> {
    const keywords: Record<string, string[]> = {
      book_flight: ['flight', 'fly', 'ticket', 'plane'],
      check_status: ['status', 'check', 'where', 'track'],
      cancel_booking: ['cancel', 'refund', 'delete'],
    };

    const scores: Record<string, number> = {};
    const lowerInput = input.toLowerCase();

    for (const [label, words] of Object.entries(keywords)) {
      scores[label] = words.filter((w) => lowerInput.includes(w)).length / words.length;
    }

    const predictions = Object.entries(scores)
      .map(([label, confidence]) => ({ label, confidence }))
      .sort((a, b) => b.confidence - a.confidence);

    return { predictions };
  },
};

const router = new ConfidenceRouter({
  routeThreshold: 0.5,
  fallbackThreshold: 0.1,
  clarificationEnabled: true,
});

router.registerClassifier(keywordClassifier);

async function main(): Promise<void> {
  const inputs = [
    'I want to book a flight to Paris',
    'Can you check the status of my booking?',
    'I need to cancel my reservation',
    'Something completely unrelated',
  ];

  for (const input of inputs) {
    const decision = await router.process(input, 'keyword-classifier');
    console.log(`Input: "${input}"`);
    console.log(`  → ${decision.type}${decision.target ? `: ${decision.target}` : ''}`);
    if (decision.prompt) {
      console.log(`  → ${decision.prompt}`);
    }
    console.log();
  }
}

main().catch(console.error);

import { ConfidenceRouter } from '@reaatech/confidence-router';

const router = new ConfidenceRouter({
  routeThreshold: 0.8,
  fallbackThreshold: 0.3,
  clarificationEnabled: true,
});

const classifications = [
  {
    // High confidence → ROUTE
    predictions: [
      { label: 'book_flight', confidence: 0.92 },
      { label: 'check_status', confidence: 0.05 },
      { label: 'cancel_booking', confidence: 0.03 },
    ],
  },
  {
    // Medium confidence → CLARIFY
    predictions: [
      { label: 'book_flight', confidence: 0.55 },
      { label: 'check_status', confidence: 0.45 },
    ],
  },
  {
    // Low confidence → FALLBACK
    predictions: [
      { label: 'book_flight', confidence: 0.25 },
      { label: 'check_status', confidence: 0.2 },
      { label: 'cancel_booking', confidence: 0.15 },
    ],
  },
];

for (const classification of classifications) {
  const decision = router.decide(classification);
  console.log(`Type: ${decision.type}`);

  if (decision.type === 'ROUTE') {
    console.log(`  → Route to: ${decision.target} (confidence: ${decision.confidence})`);
  } else if (decision.type === 'CLARIFY') {
    console.log(`  → Clarify: ${decision.prompt}`);
  } else {
    console.log('  → Fallback triggered');
  }
  console.log();
}

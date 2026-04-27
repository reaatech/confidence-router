import { ConfidenceRouter } from '../src/index.js';

const router = new ConfidenceRouter({
  routeThreshold: 0.8,
  fallbackThreshold: 0.3,
  clarificationEnabled: true,
  maxClarificationOptions: 3,
});

const classification = {
  predictions: [
    { label: 'book_flight', confidence: 0.55 },
    { label: 'check_status', confidence: 0.35 },
    { label: 'cancel_booking', confidence: 0.1 },
  ],
};

(async (): Promise<void> => {
  const languages = ['en', 'es', 'fr', 'de', 'ja', 'zh-cn', 'ar'];

  try {
    for (const lang of languages) {
      router.updateConfig({ clarificationLanguages: [lang] });
      const decision = router.decide(classification);

      if (decision.type === 'CLARIFY') {
        console.log(`[${lang}] ${decision.prompt}`);
      }
    }
  } catch (err) {
    console.error(err);
  }
})();

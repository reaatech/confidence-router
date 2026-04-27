import { ConfidenceRouter } from '../src/index.js';
import type { EvaluationDataset } from '../src/index.js';

// Sample labeled dataset for threshold tuning
const dataset: EvaluationDataset = {
  examples: [
    { input: 'book a flight', expectedLabel: 'book_flight' },
    { input: 'I want to fly to Tokyo', expectedLabel: 'book_flight' },
    { input: 'get me a plane ticket', expectedLabel: 'book_flight' },
    { input: 'check my booking status', expectedLabel: 'check_status' },
    { input: 'where is my reservation', expectedLabel: 'check_status' },
    { input: 'track my flight', expectedLabel: 'check_status' },
    { input: 'cancel my booking', expectedLabel: 'cancel_booking' },
    { input: 'I want a refund', expectedLabel: 'cancel_booking' },
    { input: 'delete my reservation', expectedLabel: 'cancel_booking' },
    { input: 'hello', expectedLabel: 'greeting' },
    { input: 'thanks', expectedLabel: 'greeting' },
  ],
};

const router = new ConfidenceRouter({
  routeThreshold: 0.8,
  fallbackThreshold: 0.3,
  clarificationEnabled: true,
});

console.log('Current thresholds:');
console.log(`  routeThreshold: ${router.getConfig().routeThreshold}`);
console.log(`  fallbackThreshold: ${router.getConfig().fallbackThreshold}`);
console.log();

// Evaluate with current thresholds
const currentMetrics = router.evaluate(dataset);
console.log('Current performance:');
console.log(`  Accuracy:  ${(currentMetrics.accuracy * 100).toFixed(1)}%`);
console.log(`  Precision: ${(currentMetrics.precision * 100).toFixed(1)}%`);
console.log(`  Recall:    ${(currentMetrics.recall * 100).toFixed(1)}%`);
console.log(`  F1 Score:  ${(currentMetrics.f1Score * 100).toFixed(1)}%`);
console.log();

// Grid search for optimal thresholds
console.log('Running grid search...');
const optimized = router.optimizeThresholds(dataset, [0.6, 0.7, 0.8, 0.9], [0.1, 0.2, 0.3, 0.4]);

console.log('Optimal thresholds:');
console.log(`  routeThreshold: ${optimized.routeThreshold}`);
console.log(`  fallbackThreshold: ${optimized.fallbackThreshold}`);
console.log(`  F1 Score: ${(optimized.score * 100).toFixed(1)}%`);
console.log();

console.log('Optimized performance:');
console.log(`  Accuracy:  ${(optimized.metrics.accuracy * 100).toFixed(1)}%`);
console.log(`  Precision: ${(optimized.metrics.precision * 100).toFixed(1)}%`);
console.log(`  Recall:    ${(optimized.metrics.recall * 100).toFixed(1)}%`);
console.log(`  F1 Score:  ${(optimized.metrics.f1Score * 100).toFixed(1)}%`);

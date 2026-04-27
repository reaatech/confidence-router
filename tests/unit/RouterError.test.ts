import { describe, it, expect } from 'vitest';
import { RouterError, RouterErrorType } from '../../src/types/errors.js';

describe('RouterError', () => {
  it('should store error type and message', () => {
    const error = new RouterError(RouterErrorType.CONFIGURATION_ERROR, 'Invalid config');

    expect(error.type).toBe(RouterErrorType.CONFIGURATION_ERROR);
    expect(error.message).toBe('Invalid config');
    expect(error.name).toBe('RouterError');
  });

  it('should optionally store details', () => {
    const details = { field: 'routeThreshold', value: -0.5 };
    const error = new RouterError(
      RouterErrorType.THRESHOLD_INVALID,
      'Threshold out of range',
      details
    );

    expect(error.details).toEqual(details);
  });

  it('should be an instance of Error', () => {
    const error = new RouterError(RouterErrorType.CLASSIFICATION_ERROR, 'Bad input');

    expect(error).toBeInstanceOf(Error);
    expect(error).toBeInstanceOf(RouterError);
  });

  it('should have a stack trace', () => {
    const error = new RouterError(RouterErrorType.LANGUAGE_NOT_SUPPORTED, 'Unknown language');

    expect(error.stack).toBeDefined();
    expect(error.stack).toContain('RouterError');
  });

  it('should stringify correctly', () => {
    const error = new RouterError(RouterErrorType.CLASSIFIER_NOT_FOUND, 'Classifier missing');

    expect(String(error)).toBe('RouterError: Classifier missing');
  });
});

export enum RouterErrorType {
  CONFIGURATION_ERROR = 'CONFIGURATION_ERROR',
  CLASSIFICATION_ERROR = 'CLASSIFICATION_ERROR',
  LANGUAGE_NOT_SUPPORTED = 'LANGUAGE_NOT_SUPPORTED',
  THRESHOLD_INVALID = 'THRESHOLD_INVALID',
  CLASSIFIER_NOT_FOUND = 'CLASSIFIER_NOT_FOUND',
  DATASET_INVALID = 'DATASET_INVALID',
}

export class RouterError extends Error {
  constructor(
    public readonly type: RouterErrorType,
    message: string,
    public readonly details?: Record<string, unknown>,
  ) {
    super(message);
    this.name = 'RouterError';
  }
}

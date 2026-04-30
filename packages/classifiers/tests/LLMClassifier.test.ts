import { RouterError } from '@reaatech/confidence-router-core';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { LLMClassifier } from '../src/index.js';

describe('LLMClassifier', () => {
  let originalFetch: typeof globalThis.fetch;

  beforeEach(() => {
    originalFetch = globalThis.fetch;
  });

  afterEach(() => {
    globalThis.fetch = originalFetch;
    vi.restoreAllMocks();
  });

  function mockFetch(response: unknown, status = 200) {
    globalThis.fetch = vi.fn().mockResolvedValue({
      ok: status >= 200 && status < 300,
      status,
      text: async () => JSON.stringify(response),
      json: async () => response,
    } as Response);
  }

  function mockFetchRejected(error: Error) {
    globalThis.fetch = vi.fn().mockRejectedValue(error);
  }

  it('classifies via OpenAI API', async () => {
    mockFetch({
      choices: [
        {
          message: {
            content: JSON.stringify({
              predictions: [
                { label: 'book_flight', confidence: 0.85 },
                { label: 'cancel_booking', confidence: 0.15 },
              ],
            }),
          },
        },
      ],
    });

    const classifier = new LLMClassifier({
      provider: 'openai',
      apiKey: 'test-key',
      labels: ['book_flight', 'cancel_booking'],
    });

    const result = await classifier.classify('I want to fly to Paris');

    expect(result.predictions[0].label).toBe('book_flight');
    expect(result.predictions[0].confidence).toBe(0.85);
    expect(globalThis.fetch).toHaveBeenCalledWith(
      'https://api.openai.com/v1/chat/completions',
      expect.objectContaining({
        method: 'POST',
        headers: expect.objectContaining({
          Authorization: 'Bearer test-key',
        }),
      }),
    );
  });

  it('classifies via Anthropic API', async () => {
    mockFetch({
      content: [
        {
          type: 'text',
          text: JSON.stringify({
            predictions: [
              { label: 'check_status', confidence: 0.9 },
              { label: 'book_flight', confidence: 0.1 },
            ],
          }),
        },
      ],
    });

    const classifier = new LLMClassifier({
      provider: 'anthropic',
      apiKey: 'test-key',
      labels: ['book_flight', 'check_status'],
    });

    const result = await classifier.classify('Where is my order?');

    expect(result.predictions[0].label).toBe('check_status');
    expect(globalThis.fetch).toHaveBeenCalledWith(
      'https://api.anthropic.com/v1/messages',
      expect.objectContaining({
        method: 'POST',
        headers: expect.objectContaining({
          'x-api-key': 'test-key',
        }),
      }),
    );
  });

  it('strips markdown fences from LLM response', async () => {
    mockFetch({
      choices: [
        {
          message: {
            content: `\`\`\`json\n${JSON.stringify({
              predictions: [{ label: 'a', confidence: 1.0 }],
            })}\n\`\`\``,
          },
        },
      ],
    });

    const classifier = new LLMClassifier({
      provider: 'openai',
      apiKey: 'test-key',
      labels: ['a', 'b'],
    });

    const result = await classifier.classify('x');
    expect(result.predictions[0].label).toBe('a');
  });

  it('fills missing labels with zero confidence', async () => {
    mockFetch({
      choices: [
        {
          message: {
            content: JSON.stringify({
              predictions: [{ label: 'a', confidence: 1.0 }],
            }),
          },
        },
      ],
    });

    const classifier = new LLMClassifier({
      provider: 'openai',
      apiKey: 'test-key',
      labels: ['a', 'b', 'c'],
    });

    const result = await classifier.classify('x');

    expect(result.predictions).toHaveLength(3);
    const labels = result.predictions.map((p) => p.label);
    expect(labels).toContain('a');
    expect(labels).toContain('b');
    expect(labels).toContain('c');
  });

  it('caps confidence values to [0, 1]', async () => {
    mockFetch({
      choices: [
        {
          message: {
            content: JSON.stringify({
              predictions: [
                { label: 'a', confidence: 1.5 },
                { label: 'b', confidence: -0.3 },
              ],
            }),
          },
        },
      ],
    });

    const classifier = new LLMClassifier({
      provider: 'openai',
      apiKey: 'test-key',
      labels: ['a', 'b'],
    });

    const result = await classifier.classify('x');

    expect(result.predictions[0].confidence).toBe(1);
    expect(result.predictions[1].confidence).toBe(0);
  });

  it('throws on API error', async () => {
    mockFetch({ error: 'bad request' }, 400);

    const classifier = new LLMClassifier({
      provider: 'openai',
      apiKey: 'test-key',
      labels: ['a'],
      retries: 0,
    });

    await expect(classifier.classify('x')).rejects.toThrow(RouterError);
  });

  it('retries on failure and eventually succeeds', async () => {
    globalThis.fetch = vi
      .fn()
      .mockRejectedValueOnce(new Error('network'))
      .mockResolvedValueOnce({
        ok: true,
        status: 200,
        text: async () => '',
        json: async () => ({
          choices: [
            {
              message: {
                content: JSON.stringify({
                  predictions: [{ label: 'a', confidence: 1 }],
                }),
              },
            },
          ],
        }),
      } as Response);

    const classifier = new LLMClassifier({
      provider: 'openai',
      apiKey: 'test-key',
      labels: ['a'],
      retries: 1,
    });

    const result = await classifier.classify('x');
    expect(result.predictions[0].label).toBe('a');
    expect(globalThis.fetch).toHaveBeenCalledTimes(2);
  });

  it('throws after exhausting retries', async () => {
    mockFetchRejected(new Error('network'));

    const classifier = new LLMClassifier({
      provider: 'openai',
      apiKey: 'test-key',
      labels: ['a'],
      retries: 1,
    });

    await expect(classifier.classify('x')).rejects.toThrow('failed after 2 attempts');
  });

  it('throws on invalid JSON response', async () => {
    mockFetch({
      choices: [{ message: { content: 'not json' } }],
    });

    const classifier = new LLMClassifier({
      provider: 'openai',
      apiKey: 'test-key',
      labels: ['a'],
      retries: 0,
    });

    await expect(classifier.classify('x')).rejects.toThrow('invalid JSON');
  });

  it('throws on missing predictions array', async () => {
    mockFetch({
      choices: [{ message: { content: JSON.stringify({ foo: 'bar' }) } }],
    });

    const classifier = new LLMClassifier({
      provider: 'openai',
      apiKey: 'test-key',
      labels: ['a'],
      retries: 0,
    });

    await expect(classifier.classify('x')).rejects.toThrow('missing "predictions" array');
  });

  it('throws on unknown label from LLM', async () => {
    mockFetch({
      choices: [
        {
          message: {
            content: JSON.stringify({
              predictions: [{ label: 'unknown', confidence: 1 }],
            }),
          },
        },
      ],
    });

    const classifier = new LLMClassifier({
      provider: 'openai',
      apiKey: 'test-key',
      labels: ['a'],
      retries: 0,
    });

    await expect(classifier.classify('x')).rejects.toThrow('unknown label');
  });

  it('throws when no labels provided', () => {
    expect(
      () =>
        new LLMClassifier({
          provider: 'openai',
          apiKey: 'test-key',
          labels: [],
        }),
    ).toThrow('requires at least one label');
  });

  it('throws on empty label string', () => {
    expect(
      () =>
        new LLMClassifier({
          provider: 'openai',
          apiKey: 'test-key',
          labels: ['valid', ''],
        }),
    ).toThrow('non-empty strings');
  });

  it('throws on duplicate labels', () => {
    expect(
      () =>
        new LLMClassifier({
          provider: 'openai',
          apiKey: 'test-key',
          labels: ['dup', 'dup'],
        }),
    ).toThrow('Duplicate label');
  });

  it('falls back to zero confidence for non-numeric confidence', async () => {
    mockFetch({
      choices: [
        {
          message: {
            content: JSON.stringify({
              predictions: [{ label: 'a', confidence: 'high' }],
            }),
          },
        },
      ],
    });

    const classifier = new LLMClassifier({
      provider: 'openai',
      apiKey: 'test-key',
      labels: ['a', 'b'],
      retries: 0,
    });

    const result = await classifier.classify('x');
    expect(result.predictions[0].confidence).toBe(0);
  });

  it('throws on invalid timeout', () => {
    expect(
      () =>
        new LLMClassifier({
          provider: 'openai',
          apiKey: 'test-key',
          labels: ['a'],
          timeout: 0,
        }),
    ).toThrow('timeout must be positive');
  });

  it('throws on invalid retries', () => {
    expect(
      () =>
        new LLMClassifier({
          provider: 'openai',
          apiKey: 'test-key',
          labels: ['a'],
          retries: -1,
        }),
    ).toThrow('retries must be >= 0');
  });

  it('reads API key from environment when not provided', () => {
    const originalEnv = process.env.OPENAI_API_KEY;
    process.env.OPENAI_API_KEY = 'env-key';

    try {
      const classifier = new LLMClassifier({
        provider: 'openai',
        labels: ['a'],
      });
      expect(classifier).toBeDefined();
    } finally {
      process.env.OPENAI_API_KEY = originalEnv;
    }
  });

  it('throws when API key is missing', () => {
    const originalEnv = process.env.OPENAI_API_KEY;
    // biome-ignore lint/performance/noDelete: required to test missing env var behavior
    delete process.env.OPENAI_API_KEY;

    try {
      expect(
        () =>
          new LLMClassifier({
            provider: 'openai',
            labels: ['a'],
          }),
      ).toThrow('requires an apiKey');
    } finally {
      if (originalEnv) process.env.OPENAI_API_KEY = originalEnv;
    }
  });

  it('exposes name, type, enabled, and priority', () => {
    const classifier = new LLMClassifier({
      provider: 'openai',
      apiKey: 'k',
      labels: ['a'],
      name: 'my-llm',
      priority: 10,
      enabled: false,
    });

    expect(classifier.name).toBe('my-llm');
    expect(classifier.type).toBe('llm');
    expect(classifier.priority).toBe(10);
    expect(classifier.enabled).toBe(false);
  });

  it('validate resolves to true for valid classifier', async () => {
    const classifier = new LLMClassifier({
      provider: 'openai',
      apiKey: 'k',
      labels: ['a'],
    });
    await expect(classifier.validate()).resolves.toBe(true);
  });

  it('uses custom baseUrl when provided', async () => {
    mockFetch({
      choices: [
        {
          message: {
            content: JSON.stringify({
              predictions: [{ label: 'a', confidence: 1 }],
            }),
          },
        },
      ],
    });

    const classifier = new LLMClassifier({
      provider: 'openai',
      apiKey: 'test-key',
      labels: ['a'],
      baseUrl: 'https://custom.openai.com/v1',
    });

    await classifier.classify('x');
    expect(globalThis.fetch).toHaveBeenCalledWith(
      'https://custom.openai.com/v1/chat/completions',
      expect.anything(),
    );
  });
});

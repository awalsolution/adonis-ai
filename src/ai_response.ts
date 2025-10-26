/*
|--------------------------------------------------------------------------
| AI Response
|--------------------------------------------------------------------------
|
| This class represents a consistent response object returned by all AI drivers,
| similar to how MailResponse works in the mail package.
|
*/

// Removed unused import

/**
 * AI Response represents a consistent response object returned
 * by all AI drivers
 */
export class AIResponse<T = undefined> {
  constructor(
    public text: string,
    public usage: {
      tokens?: number
      inputTokens?: number
      outputTokens?: number
    },
    public finishReason?: string,
    public model?: string,
    public original?: T
  ) {}
}

/**
 * AI Chat Response extends AI Response with conversation context
 */
export class AIChatResponse extends AIResponse {
  constructor(
    text: string,
    public messages: Array<{ role: 'user' | 'assistant'; content: string }>,
    usage: {
      tokens?: number
      inputTokens?: number
      outputTokens?: number
    },
    finishReason?: string,
    model?: string,
    original?: any
  ) {
    super(text, usage, finishReason, model, original)
  }
}

/**
 * AI Embedding Response for vector embeddings
 */
export class AIEmbeddingResponse {
  constructor(
    public embeddings: number[][],
    public usage: {
      tokens?: number
    },
    public original?: any
  ) {}
}

/**
 * AI Stream Response for streaming text generation
 */
export class AIStreamResponse {
  constructor(
    public text: string,
    public stream: AsyncIterable<string>,
    public usage: {
      tokens?: number
    },
    public original?: any
  ) {}
}

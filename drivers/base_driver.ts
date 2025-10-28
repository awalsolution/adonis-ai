/*
|--------------------------------------------------------------------------
| Base AI Driver
|--------------------------------------------------------------------------
|
| Simple base class that provides common error handling for all AI drivers.
| Each driver extends this to get consistent error management.
|
|
*/

import type {
  AIDriverContract,
  AIResponse,
  AIChatResponse,
  AIEmbeddingResponse,
  AIStreamResponse,
  AIChatMessage,
} from '../src/types.js'
import {
  AIApiKeyException,
  AIServiceException,
  AIRateLimitException,
  AITimeoutException,
} from '../src/errors.js'

/**
 * Base class for all AI drivers.
 * Provides common error handling and utilities.
 */
export abstract class BaseAIDriver implements AIDriverContract {
  protected providerName: string
  protected timeout: number
  protected maxRetries: number

  constructor(providerName: string, timeout: number = 30000, maxRetries: number = 3) {
    this.providerName = providerName
    this.timeout = timeout
    this.maxRetries = maxRetries
  }

  /**
   * Convert API errors to user-friendly exceptions
   */
  protected mapCommonErrors(error: any): never {
    const message = error.message || 'Unknown error occurred'
    const statusCode = error.status || error.code

    // Missing or invalid API key
    if (this.isAuthError(message, statusCode)) {
      throw new AIApiKeyException(this.providerName)
    }

    // Rate limit exceeded
    if (this.isRateLimitError(message, statusCode)) {
      throw new AIRateLimitException(this.providerName)
    }

    // Request timeout
    if (this.isTimeoutError(message, statusCode)) {
      throw new AITimeoutException(this.providerName, 30000)
    }

    // Service unavailable
    if (this.isServiceError(message, statusCode)) {
      throw new AIServiceException(this.providerName, 'Service temporarily unavailable', 503)
    }

    // Default error
    throw new AIServiceException(this.providerName, message)
  }

  /**
   * Check if error is related to authentication
   */
  private isAuthError(message: string, statusCode?: number): boolean {
    return (
      message.includes('api key') ||
      message.includes('API_KEY') ||
      message.includes('authentication') ||
      message.includes('401') ||
      statusCode === 401
    )
  }

  /**
   * Check if error is related to rate limiting
   */
  private isRateLimitError(message: string, statusCode?: number): boolean {
    return message.includes('rate limit') || message.includes('429') || statusCode === 429
  }

  /**
   * Check if error is related to timeouts
   */
  private isTimeoutError(message: string, statusCode?: number): boolean {
    return message.includes('timeout') || message.includes('408') || statusCode === 408
  }

  /**
   * Check if error is related to service availability
   */
  private isServiceError(message: string, statusCode?: number): boolean {
    return (
      message.includes('503') ||
      message.includes('502') ||
      message.includes('SERVICE_UNAVAILABLE') ||
      statusCode === 503 ||
      statusCode === 502
    )
  }

  /**
   * Estimate token count (rough approximation)
   * Note: This is a simple estimation based on character count.
   * For production use with OpenAI, consider using the tiktoken library.
   * Accuracy varies by language - works best for English text.
   */
  protected estimateTokens(text: string): number {
    // Rough estimation: ~4 characters per token
    return Math.ceil(text.length / 4)
  }

  /**
   * Execute a function with timeout
   */
  protected async withTimeout<T>(promise: Promise<T>, timeoutMs?: number): Promise<T> {
    const timeout = timeoutMs || this.timeout

    return Promise.race([
      promise,
      new Promise<T>((_, reject) => {
        setTimeout(() => {
          reject(new AITimeoutException(this.providerName, timeout))
        }, timeout)
      }),
    ])
  }

  /**
   * Execute a function with retry logic and exponential backoff
   */
  protected async withRetry<T>(fn: () => Promise<T>, retries?: number): Promise<T> {
    const maxRetries = retries !== undefined ? retries : this.maxRetries
    let lastError: any

    for (let attempt = 0; attempt <= maxRetries; attempt++) {
      try {
        return await fn()
      } catch (error: any) {
        lastError = error

        // Don't retry on authentication errors or validation errors
        if (
          error instanceof AIApiKeyException ||
          error.status === 400 ||
          error.status === 401 ||
          error.status === 403
        ) {
          throw error
        }

        // Don't retry if this was the last attempt
        if (attempt === maxRetries) {
          break
        }

        // Calculate exponential backoff delay
        const delay = Math.min(1000 * Math.pow(2, attempt), 10000)

        // Add jitter to prevent thundering herd
        const jitter = Math.random() * 1000

        await new Promise((resolve) => setTimeout(resolve, delay + jitter))
      }
    }

    throw lastError
  }

  // Each driver must implement these methods
  abstract generate(prompt: string, options?: any): Promise<AIResponse>
  abstract chat(messages: AIChatMessage[], options?: any): Promise<AIChatResponse>
  abstract embed(text: string | string[], options?: any): Promise<AIEmbeddingResponse>
  abstract stream(prompt: string, options?: any): Promise<AIStreamResponse>
}

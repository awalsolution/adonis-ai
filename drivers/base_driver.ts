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

  constructor(providerName: string) {
    this.providerName = providerName
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
   */
  protected estimateTokens(text: string): number {
    // Rough estimation: ~4 characters per token
    return Math.ceil(text.length / 4)
  }

  // Each driver must implement these methods
  abstract generate(prompt: string): Promise<AIResponse>
  abstract chat(messages: AIChatMessage[]): Promise<AIChatResponse>
  abstract embed(text: string | string[]): Promise<AIEmbeddingResponse>
  abstract stream(prompt: string): Promise<AIStreamResponse>
}

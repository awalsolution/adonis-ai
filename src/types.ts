/*
|--------------------------------------------------------------------------
| AI Package Types
|--------------------------------------------------------------------------
|
| This file contains all the TypeScript types and interfaces used
| throughout the AI package, following the same pattern as AdonisJS Drive.
|
*/

/**
 * AI message interface for chat completions
 */
export interface AiMessage {
  role: 'system' | 'user' | 'assistant'
  content: string
}

/**
 * AI response interface for text and chat completions
 */
export interface AiResponse {
  content: string
  usage: {
    promptTokens: number
    completionTokens: number
    totalTokens: number
  }
  model: string
  finishReason: string
}

/**
 * AI streaming response interface
 */
export interface AiStreamResponse {
  content: string
  finishReason?: string
}

/**
 * AI configuration interface
 */
export interface AiConfig {
  apiKey: string
  model?: string
  maxTokens?: number
  temperature?: number
  organization?: string // OpenAI specific
  embeddingModel?: string
  [key: string]: any
}

/**
 * Driver-specific config types (mirror Drive's per-driver typing pattern)
 */
export type { OpenAiDriverConfig, OpenAiDriverName } from '../drivers/openai/types.js'
export type { GeminiDriverConfig, GeminiDriverName } from '../drivers/gemini/types.js'

/**
 * AI driver interface that all drivers must implement
 */
export interface AiDriver {
  generateText(prompt: string, options?: any): Promise<AiResponse>
  generateChat(messages: AiMessage[], options?: any): Promise<AiResponse>
  generateChatStream(messages: AiMessage[], options?: any): AsyncGenerator<AiStreamResponse>
  generateEmbeddings(input: string | string[], options?: any): Promise<number[][]>
  generateImages(prompt: string, options?: any): Promise<string[]>
  getDriverName(): string
  isConfigured(): Promise<boolean>
}

/**
 * AI manager configuration interface
 */
export interface AiManagerConfig {
  default: string
  disks: {
    [key: string]: AiConfig
  }
}

/**
 * AI provider configuration interface
 */
export interface AiProviderConfig {
  default: string
  providers: {
    [key: string]: {
      driver: string
      config: AiConfig
    }
  }
}

/**
 * AI service interface for the main AI service
 */
export interface AiService {
  use(provider: string): Promise<AiDriver>
  generateText(prompt: string, options?: any): Promise<AiResponse>
  generateChat(messages: AiMessage[], options?: any): Promise<AiResponse>
  generateChatStream(messages: AiMessage[], options?: any): AsyncGenerator<AiStreamResponse>
  generateEmbeddings(input: string | string[], options?: any): Promise<number[][]>
  generateImages(prompt: string, options?: any): Promise<string[]>
}

/**
 * Error classes for AI operations
 */
export class AiError extends Error {
  constructor(
    message: string,
    public code?: string
  ) {
    super(message)
    this.name = 'AiError'
  }
}

export class AiConfigurationError extends AiError {
  constructor(message: string) {
    super(message, 'AI_CONFIGURATION_ERROR')
    this.name = 'AiConfigurationError'
  }
}

export class AiProviderError extends AiError {
  constructor(message: string) {
    super(message, 'AI_PROVIDER_ERROR')
    this.name = 'AiProviderError'
  }
}

export class AiDriverError extends AiError {
  constructor(message: string) {
    super(message, 'AI_DRIVER_ERROR')
    this.name = 'AiDriverError'
  }
}

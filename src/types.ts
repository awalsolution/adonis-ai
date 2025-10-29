/*
|--------------------------------------------------------------------------
| AI Types
|--------------------------------------------------------------------------
|
| This file contains all the type definitions for the AI package.
| It follows the same pattern as the Drive package types.
|
*/

import type { ConfigProvider } from '@adonisjs/core/types'

/**
 * Core AI types for responses and requests.
 * These types define the structure of AI service responses.
 */
export interface AIResponse {
  text: string
  usage?: {
    tokens: number
    inputTokens?: number
    outputTokens?: number
  }
  finishReason?: string
  model?: string
}

export interface AIChatMessage {
  role: 'user' | 'assistant' | 'system'
  content: string
}

export interface AIChatResponse extends AIResponse {
  messages: AIChatMessage[]
}

export interface AIEmbeddingResponse {
  embeddings: number[][]
  usage?: {
    tokens: number
  }
}

export interface AIStreamResponse extends AIResponse {
  stream: AsyncIterable<string>
}

/**
 * Core AI driver interface that all AI providers must implement.
 * This defines the contract for AI service interactions, similar to MailTransportContract.
 */
export interface AIDriverContract {
  /**
   * Generate text from a prompt
   */
  generate(prompt: string, options?: any): Promise<AIResponse>

  /**
   * Generate chat completion from messages
   */
  chat(messages: AIChatMessage[], options?: any): Promise<AIChatResponse>

  /**
   * Generate embeddings for text
   */
  embed(text: string | string[], options?: any): Promise<AIEmbeddingResponse>

  /**
   * Generate streaming response
   */
  stream(prompt: string, options?: any): Promise<AIStreamResponse>

  /**
   * Cleanup transport connections
   */
  close?(): void | Promise<void>
}

/**
 * Factory function to lazily initiate an AI driver
 */
export type AIDriverFactory = () => AIDriverContract

/**
 * Core AI driver interface that all AI providers must implement.
 * This defines the contract for AI service interactions.
 */
export interface AIDriver extends AIDriverContract {}

/**
 * Configuration options for OpenAI driver.
 */
export interface OpenAIConfig {
  apiKey: string
  model?: string
  embeddingModel?: string
  maxTokens?: number
  temperature?: number
  timeout?: number
  maxRetries?: number
}

/**
 * Configuration options for Gemini driver.
 */
export interface GeminiConfig {
  apiKey: string
  model?: string
  embeddingModel?: string
  maxTokens?: number
  temperature?: number
  timeout?: number
  maxRetries?: number
}

/**
 * Representation of a factory function that returns
 * an instance of an AI driver. Used to create driver instances
 * on demand.
 */
export type AIDriverFactoryFunction = () => AIDriver

/**
 * Service config provider is an extension of the config
 * provider and accepts the name of the AI service.
 * Used to configure services during setup.
 */
export interface ServiceConfigProvider<Factory extends AIDriverFactory> {
  type: 'provider'
  resolver: (name: string) => Promise<Factory>
}

/**
 * A list of AI services inferred using the config defined inside
 * the user-land application. This interface is extended via
 * declaration merging to provide type-safe service names.
 */
export interface AIServices {}

/**
 * Utility type that infers the AI services configuration
 * from a config provider type.
 */
export type InferAIServices<
  T extends ConfigProvider<{ config: { services: Record<string, AIDriverFactory> } }>,
> = Awaited<ReturnType<T['resolver']>>['config']['services']

/**
 * AI service represents a singleton instance of the AIManager
 * configured using the "config/ai.ts" file. This is the main
 * interface you interact with to access configured AI services.
 */
export interface AIService extends AIManager {}

/**
 * AI Manager interface for managing multiple AI drivers.
 */
export interface AIManager {
  use(driver?: string): AIDriver
  useDefault(): AIDriver
  getDefaultDriver(): string
  getAvailableDrivers(): string[]
  hasDriver(driver: string): boolean
  getConfiguredServices(): string[]
  getTimeout(): number
  getMaxRetries(): number
  get default(): AIDriver
}

/**
 * AI Error interface for error handling.
 */
export interface AIError extends Error {
  code?: string
  provider?: string
  statusCode?: number
}

/**
 * AI Configuration interface.
 */
export interface AIConfig {
  default: string
  timeout: number
  maxRetries: number
  services: Record<string, AIDriverFactoryFunction>
}

/*
|--------------------------------------------------------------------------
| AI Contracts
|--------------------------------------------------------------------------
|
| This file contains the contracts that define the interface between
| the AI package and the AdonisJS application, following the same
| pattern as AdonisJS Drive contracts.
|
*/

import type { AiService } from './types.js'

/**
 * AI contract interface
 */
export interface AiContract {
  /**
   * Get the AI service instance
   */
  getAiService(): AiService
}

/**
 * AI manager contract interface
 */
export interface AiManagerContract {
  /**
   * Use a specific AI provider
   */
  use(provider: string): any

  /**
   * Get the default AI provider
   */
  getDefaultProvider(): any

  /**
   * Check if a provider exists
   */
  hasProvider(provider: string): boolean

  /**
   * Get all available providers
   */
  getProviders(): string[]

  /**
   * Validate the configuration
   */
  validateConfig(): void

  /**
   * Test all providers
   */
  testProviders(): Promise<{ [key: string]: boolean }>
}

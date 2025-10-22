/*
|--------------------------------------------------------------------------
| AI Service
|--------------------------------------------------------------------------
|
| The main AI service that provides a unified interface for working with
| different AI providers. It follows the same pattern as AdonisJS Drive.
|
*/

import type { AiService, AiDriver, AiMessage, AiResponse, AiStreamResponse } from './types.js'
import { AiManager } from './ai_manager.js'

/**
 * AI Service implementation
 */
export class Ai implements AiService {
  private manager: AiManager
  private currentProvider?: string

  constructor(manager: AiManager) {
    this.manager = manager
  }

  /**
   * Use a specific AI provider
   */
  async use(provider: string): Promise<AiDriver> {
    this.currentProvider = provider
    return this.manager.use(provider)
  }

  /**
   * Generate text completion using the current or default provider
   */
  async generateText(prompt: string, options?: any): Promise<AiResponse> {
    const driver = await this.getCurrentDriver()
    return driver.generateText(prompt, options)
  }

  /**
   * Generate chat completion using the current or default provider
   */
  async generateChat(messages: AiMessage[], options?: any): Promise<AiResponse> {
    const driver = await this.getCurrentDriver()
    return driver.generateChat(messages, options)
  }

  /**
   * Generate streaming chat completion using the current or default provider
   */
  async *generateChatStream(
    messages: AiMessage[],
    options?: any
  ): AsyncGenerator<AiStreamResponse> {
    const driver = await this.getCurrentDriver()
    yield* driver.generateChatStream(messages, options)
  }

  /**
   * Generate embeddings using the current or default provider
   */
  async generateEmbeddings(input: string | string[], options?: any): Promise<number[][]> {
    const driver = await this.getCurrentDriver()
    return driver.generateEmbeddings(input, options)
  }

  /**
   * Generate images using the current or default provider
   */
  async generateImages(prompt: string, options?: any): Promise<string[]> {
    const driver = await this.getCurrentDriver()
    return driver.generateImages(prompt, options)
  }

  /**
   * Get the current driver or default driver
   */
  private async getCurrentDriver(): Promise<AiDriver> {
    if (this.currentProvider) {
      return this.manager.use(this.currentProvider)
    }
    return this.manager.getDefaultDriver()
  }

  /**
   * Get the AI manager instance
   */
  getManager(): AiManager {
    return this.manager
  }

  /**
   * Get the current provider name
   */
  getCurrentProvider(): string | undefined {
    return this.currentProvider
  }

  /**
   * Reset to default provider
   */
  resetProvider(): void {
    this.currentProvider = undefined
  }
}

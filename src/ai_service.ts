/*
|--------------------------------------------------------------------------
| AI Service
|--------------------------------------------------------------------------
|
| The AI service represents a singleton instance of the AiManager
| configured using the "config/ai.ts" file. This is the main
| interface you interact with to access configured AI providers.
|
*/

import type { AiDriver, AiMessage, AiResponse, AiStreamResponse } from './types.js'
import { AiManager } from './ai_manager.js'

export class AiService extends AiManager {
  private currentProvider?: string

  constructor(config: any) {
    super(config)
  }

  /**
   * Use a specific AI provider
   */
  async use(provider: string): Promise<AiDriver> {
    this.currentProvider = provider
    return super.use(provider)
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
      return super.use(this.currentProvider)
    }
    return super.getDefaultDriver()
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

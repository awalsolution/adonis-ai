/*
|--------------------------------------------------------------------------
| OpenAI Driver
|--------------------------------------------------------------------------
|
| The OpenAI driver implements the AI contract using the official OpenAI SDK.
| It provides a unified interface for text generation, chat completions,
| and other AI operations.
|
*/

import OpenAI from 'openai'
import type {
  AiDriver,
  AiMessage,
  AiResponse,
  AiStreamResponse,
  AiConfig,
} from '../../src/types.js'

export class OpenAiDriver implements AiDriver {
  private client: OpenAI
  private config: AiConfig

  constructor(config: AiConfig) {
    this.config = config
    this.client = new OpenAI({
      apiKey: config.apiKey,
      organization: config.organization,
    })
  }

  /**
   * Generate text completion using OpenAI's completion API
   */
  async generateText(prompt: string, options?: any): Promise<AiResponse> {
    try {
      const response = await this.client.completions.create({
        model: options?.model || this.config.model || 'gpt-3.5-turbo-instruct',
        prompt,
        max_tokens: options?.maxTokens || this.config.maxTokens || 1000,
        temperature: options?.temperature || this.config.temperature || 0.7,
        ...options,
      })

      return {
        content: response.choices[0]?.text || '',
        usage: {
          promptTokens: response.usage?.prompt_tokens || 0,
          completionTokens: response.usage?.completion_tokens || 0,
          totalTokens: response.usage?.total_tokens || 0,
        },
        model: response.model,
        finishReason: response.choices[0]?.finish_reason || 'stop',
      }
    } catch (error: any) {
      throw new Error(`OpenAI API error: ${error.message}`)
    }
  }

  /**
   * Generate chat completion using OpenAI's chat API
   */
  async generateChat(messages: AiMessage[], options?: any): Promise<AiResponse> {
    try {
      const response = await this.client.chat.completions.create({
        model: options?.model || this.config.model || 'gpt-3.5-turbo',
        messages: messages.map((msg) => ({
          role: msg.role as 'system' | 'user' | 'assistant',
          content: msg.content,
        })),
        max_tokens: options?.maxTokens || this.config.maxTokens || 1000,
        temperature: options?.temperature || this.config.temperature || 0.7,
        ...options,
      })

      const choice = response.choices[0]
      return {
        content: choice?.message?.content || '',
        usage: {
          promptTokens: response.usage?.prompt_tokens || 0,
          completionTokens: response.usage?.completion_tokens || 0,
          totalTokens: response.usage?.total_tokens || 0,
        },
        model: response.model,
        finishReason: choice?.finish_reason || 'stop',
      }
    } catch (error: any) {
      throw new Error(`OpenAI Chat API error: ${error.message}`)
    }
  }

  /**
   * Generate streaming chat completion
   */
  async *generateChatStream(
    messages: AiMessage[],
    options?: any
  ): AsyncGenerator<AiStreamResponse> {
    try {
      const stream = await this.client.chat.completions.create({
        model: options?.model || this.config.model || 'gpt-3.5-turbo',
        messages: messages.map((msg) => ({
          role: msg.role as 'system' | 'user' | 'assistant',
          content: msg.content,
        })),
        max_tokens: options?.maxTokens || this.config.maxTokens || 1000,
        temperature: options?.temperature || this.config.temperature || 0.7,
        stream: true,
        ...options,
      })

      for await (const chunk of stream as any) {
        const delta = chunk.choices[0]?.delta
        if (delta?.content) {
          yield {
            content: delta.content,
            finishReason: chunk.choices[0]?.finish_reason,
          }
        }
      }
    } catch (error: any) {
      throw new Error(`OpenAI Chat Stream API error: ${error.message}`)
    }
  }

  /**
   * Generate embeddings using OpenAI's embedding API
   */
  async generateEmbeddings(input: string | string[], options?: any): Promise<number[][]> {
    try {
      const response = await this.client.embeddings.create({
        model: options?.model || this.config.embeddingModel || 'text-embedding-ada-002',
        input: Array.isArray(input) ? input : [input],
        ...options,
      })

      return response.data?.map((item) => item.embedding) || []
    } catch (error: any) {
      throw new Error(`OpenAI Embeddings API error: ${error.message}`)
    }
  }

  /**
   * Generate images using OpenAI's DALL-E API
   */
  async generateImages(prompt: string, options?: any): Promise<string[]> {
    try {
      const response = await this.client.images.generate({
        prompt,
        n: options?.n || 1,
        size: options?.size || '1024x1024',
        quality: options?.quality || 'standard',
        ...options,
      })

      return response.data?.map((image) => image.url!).filter(Boolean) || []
    } catch (error: any) {
      throw new Error(`OpenAI Images API error: ${error.message}`)
    }
  }

  /**
   * Get the driver name
   */
  getDriverName(): string {
    return 'openai'
  }

  /**
   * Check if the driver is properly configured
   */
  async isConfigured(): Promise<boolean> {
    try {
      await this.client.models.list()
      return true
    } catch {
      return false
    }
  }
}

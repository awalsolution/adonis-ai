/*
|--------------------------------------------------------------------------
| OpenAI Driver
|--------------------------------------------------------------------------
|
| Simple driver for OpenAI's API.
| Handles text generation, chat, embeddings, and streaming.
|
| Usage:
|   const openai = new OpenAIDriver({ apiKey: 'your-key' })
|   const response = await openai.generate('Hello world')
|
*/

import OpenAI from 'openai'
import type {
  AIDriverContract,
  AIResponse,
  AIChatResponse,
  AIEmbeddingResponse,
  AIStreamResponse,
  AIChatMessage,
} from '../../src/types.js'
import { BaseAIDriver } from '../../drivers/base_driver.js'

export interface OpenAIConfig {
  apiKey: string
  model?: string
}

export class OpenAIDriver extends BaseAIDriver implements AIDriverContract {
  private client: OpenAI
  private config: OpenAIConfig

  constructor(config: OpenAIConfig) {
    super('openai')
    this.config = config
    this.client = new OpenAI({
      apiKey: config.apiKey,
    })
  }

  /**
   * Generate text from a prompt
   */
  async generate(prompt: string, options?: any): Promise<AIResponse> {
    try {
      const completion = await this.client.chat.completions.create({
        model: this.config.model || 'gpt-3.5-turbo',
        messages: [{ role: 'user', content: prompt }],
        max_tokens: 1000,
        temperature: 0.7,
        ...options,
      })

      const choice = completion.choices[0]
      if (!choice?.message?.content) {
        throw new Error('No response generated from OpenAI API')
      }

      return {
        text: choice.message.content,
        usage: {
          tokens: completion.usage?.total_tokens || 0,
          inputTokens: completion.usage?.prompt_tokens || 0,
          outputTokens: completion.usage?.completion_tokens || 0,
        },
        finishReason: choice.finish_reason || 'unknown',
        model: completion.model,
      }
    } catch (error: any) {
      throw this.mapCommonErrors(error)
    }
  }

  /**
   * Generate chat completion from messages
   */
  async chat(messages: AIChatMessage[], options?: any): Promise<AIChatResponse> {
    try {
      const completion = await this.client.chat.completions.create({
        model: this.config.model || 'gpt-3.5-turbo',
        messages: messages as any,
        max_tokens: 1000,
        temperature: 0.7,
        ...options,
      })

      const choice = completion.choices[0]
      if (!choice?.message?.content) {
        throw new Error('No response generated from OpenAI API')
      }

      return {
        text: choice.message.content,
        messages: [...messages, { role: 'assistant', content: choice.message.content }],
        usage: {
          tokens: completion.usage?.total_tokens || 0,
          inputTokens: completion.usage?.prompt_tokens || 0,
          outputTokens: completion.usage?.completion_tokens || 0,
        },
        finishReason: choice.finish_reason || 'unknown',
        model: completion.model,
      }
    } catch (error: any) {
      throw this.mapCommonErrors(error)
    }
  }

  /**
   * Generate embeddings for text
   */
  async embed(text: string | string[], options?: any): Promise<AIEmbeddingResponse> {
    try {
      const texts = Array.isArray(text) ? text : [text]

      const response = await this.client.embeddings.create({
        model: 'text-embedding-ada-002',
        input: texts,
        ...options,
      })

      return {
        embeddings: response.data.map((item) => item.embedding),
        usage: {
          tokens: response.usage?.total_tokens || 0,
        },
      }
    } catch (error: any) {
      throw this.mapCommonErrors(error)
    }
  }

  /**
   * Generate streaming response
   */
  async stream(prompt: string, options?: any): Promise<AIStreamResponse> {
    try {
      const stream = await this.client.chat.completions.create({
        model: this.config.model || 'gpt-3.5-turbo',
        messages: [{ role: 'user', content: prompt }],
        max_tokens: 1000,
        temperature: 0.7,
        stream: true,
        ...options,
      })

      return {
        text: '',
        stream: this.processStream(stream),
        usage: { tokens: 0 },
      }
    } catch (error: any) {
      throw this.mapCommonErrors(error)
    }
  }

  /**
   * Process streaming response from OpenAI
   */
  private async *processStream(stream: any): AsyncIterable<string> {
    for await (const chunk of stream) {
      const content = chunk.choices[0]?.delta?.content
      if (content) {
        yield content
      }
    }
  }
}

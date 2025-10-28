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
import { AIConfigurationException } from '../../src/errors.js'

export interface OpenAIConfig {
  apiKey: string
  model?: string
  timeout?: number
  maxRetries?: number
}

/**
 * Default configuration constants for OpenAI driver
 */
const DEFAULT_MODEL = 'gpt-3.5-turbo'
const DEFAULT_MAX_TOKENS = 1000
const DEFAULT_TEMPERATURE = 0.7
const DEFAULT_EMBEDDING_MODEL = 'text-embedding-ada-002'

export class OpenAIDriver extends BaseAIDriver implements AIDriverContract {
  private client: OpenAI
  private defaultModel: string
  private defaultMaxTokens: number
  private defaultTemperature: number

  constructor(config: OpenAIConfig) {
    super('openai', config.timeout, config.maxRetries)
    this.defaultModel = config.model || DEFAULT_MODEL
    this.defaultMaxTokens = DEFAULT_MAX_TOKENS
    this.defaultTemperature = DEFAULT_TEMPERATURE
    this.client = new OpenAI({
      apiKey: config.apiKey,
      timeout: this.timeout,
      maxRetries: 0, // We handle retries ourselves
    })
  }

  /**
   * Generate text from a prompt
   */
  async generate(prompt: string, options?: any): Promise<AIResponse> {
    // Validate input
    if (!prompt || prompt.trim().length === 0) {
      throw new AIConfigurationException('Prompt cannot be empty')
    }

    try {
      return await this.withRetry(async () => {
        return await this.withTimeout(
          this.client.chat.completions
            .create({
              model: this.defaultModel,
              messages: [{ role: 'user', content: prompt }],
              max_tokens: this.defaultMaxTokens,
              temperature: this.defaultTemperature,
              ...options,
            })
            .then((completion) => {
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
            })
        )
      })
    } catch (error: any) {
      throw this.mapCommonErrors(error)
    }
  }

  /**
   * Generate chat completion from messages
   */
  async chat(messages: AIChatMessage[], options?: any): Promise<AIChatResponse> {
    // Validate input
    if (!messages || messages.length === 0) {
      throw new AIConfigurationException('Messages array cannot be empty')
    }

    for (const msg of messages) {
      if (!msg.content || msg.content.trim().length === 0) {
        throw new AIConfigurationException('Message content cannot be empty')
      }
    }

    try {
      return await this.withRetry(async () => {
        return await this.withTimeout(
          this.client.chat.completions
            .create({
              model: this.defaultModel,
              messages: messages as any,
              max_tokens: this.defaultMaxTokens,
              temperature: this.defaultTemperature,
              ...options,
            })
            .then((completion) => {
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
            })
        )
      })
    } catch (error: any) {
      throw this.mapCommonErrors(error)
    }
  }

  /**
   * Generate embeddings for text
   */
  async embed(text: string | string[], options?: any): Promise<AIEmbeddingResponse> {
    const texts = Array.isArray(text) ? text : [text]

    // Validate input
    if (texts.length === 0) {
      throw new AIConfigurationException('Text array cannot be empty')
    }

    for (const t of texts) {
      if (!t || t.trim().length === 0) {
        throw new AIConfigurationException('Text content cannot be empty')
      }
    }

    try {
      return await this.withRetry(async () => {
        return await this.withTimeout(
          this.client.embeddings
            .create({
              model: DEFAULT_EMBEDDING_MODEL,
              input: texts,
              ...options,
            })
            .then((response) => {
              return {
                embeddings: response.data.map((item) => item.embedding),
                usage: {
                  tokens: response.usage?.total_tokens || 0,
                },
              }
            })
        )
      })
    } catch (error: any) {
      throw this.mapCommonErrors(error)
    }
  }

  /**
   * Generate streaming response
   */
  async stream(prompt: string, options?: any): Promise<AIStreamResponse> {
    // Validate input
    if (!prompt || prompt.trim().length === 0) {
      throw new AIConfigurationException('Prompt cannot be empty')
    }

    try {
      const stream = await this.client.chat.completions.create({
        model: this.defaultModel,
        messages: [{ role: 'user', content: prompt }],
        max_tokens: this.defaultMaxTokens,
        temperature: this.defaultTemperature,
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
  private async *processStream(
    stream: AsyncIterable<OpenAI.Chat.Completions.ChatCompletionChunk> | any
  ): AsyncIterable<string> {
    for await (const chunk of stream) {
      const content = chunk.choices[0]?.delta?.content
      if (content) {
        yield content
      }
    }
  }

  /**
   * Close the driver and cleanup resources
   */
  close(): void {
    // OpenAI client doesn't require explicit cleanup
    // This method is here for consistency with the driver contract
  }
}

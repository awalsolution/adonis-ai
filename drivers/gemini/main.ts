/*
|--------------------------------------------------------------------------
| Gemini Driver
|--------------------------------------------------------------------------
|
| Driver for Google's Gemini AI API.
| Handles text generation, chat, embeddings, and streaming.
|
| Usage:
|   const gemini = new GeminiDriver({ apiKey: 'your-key' })
|   const response = await gemini.generate('Hello world')
|
*/

import { GoogleGenerativeAI } from '@google/generative-ai'
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

/**
 * Configuration for Gemini AI driver
 */
export interface GeminiConfig {
  apiKey: string
  model?: string
  timeout?: number
  maxRetries?: number
}

/**
 * Default configuration constants for Gemini driver
 */
const DEFAULT_MODEL = 'gemini-pro'
const DEFAULT_EMBEDDING_MODEL = 'embedding-001'

/**
 * Driver for Google Gemini AI API
 */
export class GeminiDriver extends BaseAIDriver implements AIDriverContract {
  private client: GoogleGenerativeAI
  private defaultModel: string

  constructor(config: GeminiConfig) {
    super('gemini', config.timeout, config.maxRetries)
    this.defaultModel = config.model || DEFAULT_MODEL
    this.client = new GoogleGenerativeAI(config.apiKey)
  }

  /**
   * Generate text from a prompt
   */
  async generate(prompt: string, _options?: any): Promise<AIResponse> {
    // Validate input
    if (!prompt || prompt.trim().length === 0) {
      throw new AIConfigurationException('Prompt cannot be empty')
    }

    try {
      return await this.withRetry(async () => {
        return await this.withTimeout(
          (async () => {
            const model = this.client.getGenerativeModel({
              model: this.defaultModel,
            })

            const result = await model.generateContent(prompt)
            const response = result.response
            const text = response.text()

            if (!text) {
              throw new Error('No response generated from Gemini API')
            }

            return {
              text,
              usage: {
                tokens: this.estimateTokens(text),
              },
              finishReason: 'completed',
              model: this.defaultModel,
            }
          })()
        )
      })
    } catch (error: any) {
      throw this.mapCommonErrors(error)
    }
  }

  /**
   * Generate chat completion from messages
   */
  async chat(messages: AIChatMessage[], _options?: any): Promise<AIChatResponse> {
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
          (async () => {
            const model = this.client.getGenerativeModel({
              model: this.defaultModel,
            })

            const chat = model.startChat({
              history: messages.slice(0, -1).map((msg) => ({
                role: msg.role === 'assistant' ? 'model' : msg.role,
                parts: [{ text: msg.content }],
              })),
            })

            const lastMessage = messages[messages.length - 1]
            const result = await chat.sendMessage(lastMessage.content)
            const response = await result.response
            const text = response.text()

            if (!text) {
              throw new Error('No response generated from Gemini API')
            }

            return {
              text,
              messages: [...messages, { role: 'assistant', content: text }],
              usage: {
                tokens: this.estimateTokens(text),
              },
              finishReason: 'completed',
              model: this.defaultModel,
            }
          })()
        )
      })
    } catch (error: any) {
      throw this.mapCommonErrors(error)
    }
  }

  /**
   * Generate embeddings for text with parallel processing
   */
  async embed(text: string | string[], _options?: any): Promise<AIEmbeddingResponse> {
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
          (async () => {
            const model = this.client.getGenerativeModel({
              model: DEFAULT_EMBEDDING_MODEL,
            })

            // Process embeddings in parallel for better performance
            const promises = texts.map((textItem) => model.embedContent(textItem))
            const results = await Promise.all(promises)
            const embeddings = results.map((r) => r.embedding.values)

            return {
              embeddings,
              usage: {
                tokens: texts.reduce((total, textItem) => total + this.estimateTokens(textItem), 0),
              },
            }
          })()
        )
      })
    } catch (error: any) {
      throw this.mapCommonErrors(error)
    }
  }

  /**
   * Generate streaming response
   */
  async stream(prompt: string, _options?: any): Promise<AIStreamResponse> {
    // Validate input
    if (!prompt || prompt.trim().length === 0) {
      throw new AIConfigurationException('Prompt cannot be empty')
    }

    try {
      const model = this.client.getGenerativeModel({
        model: this.defaultModel,
      })

      const result = await model.generateContentStream(prompt)

      return {
        text: '',
        stream: this.processStream(result.stream),
        usage: { tokens: 0 },
      }
    } catch (error: any) {
      throw this.mapCommonErrors(error)
    }
  }

  /**
   * Process streaming response from Gemini
   */
  private async *processStream(stream: any): AsyncIterable<string> {
    for await (const chunk of stream) {
      const text = chunk.text()
      if (text) {
        yield text
      }
    }
  }

  /**
   * Close the driver and cleanup resources
   */
  close(): void {
    // Gemini client doesn't require explicit cleanup
    // This method is here for consistency with the driver contract
  }
}

/*
|--------------------------------------------------------------------------
| Gemini Driver
|--------------------------------------------------------------------------
|
| Simple driver for Google's Gemini AI API.
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

/**
 * Configuration for Gemini AI driver
 */
export interface GeminiConfig {
  apiKey: string
  model?: string
}

/**
 * Driver for Google Gemini AI API
 */
export class GeminiDriver extends BaseAIDriver implements AIDriverContract {
  private client: GoogleGenerativeAI
  private config: GeminiConfig

  constructor(config: GeminiConfig) {
    super('gemini')
    this.config = config
    this.client = new GoogleGenerativeAI(config.apiKey)
  }

  /**
   * Generate text from a prompt
   */
  async generate(prompt: string): Promise<AIResponse> {
    try {
      const model = this.client.getGenerativeModel({
        model: this.config.model || 'gemini-pro',
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
        model: this.config.model || 'gemini-pro',
      }
    } catch (error: any) {
      throw this.mapCommonErrors(error)
    }
  }

  /**
   * Generate chat completion from messages
   */
  async chat(messages: AIChatMessage[]): Promise<AIChatResponse> {
    try {
      const model = this.client.getGenerativeModel({
        model: this.config.model || 'gemini-pro',
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
        model: this.config.model || 'gemini-pro',
      }
    } catch (error: any) {
      throw this.mapCommonErrors(error)
    }
  }

  /**
   * Generate embeddings for text
   */
  async embed(text: string | string[]): Promise<AIEmbeddingResponse> {
    try {
      const model = this.client.getGenerativeModel({
        model: 'embedding-001',
      })

      const texts = Array.isArray(text) ? text : [text]
      const embeddings: number[][] = []

      for (const textItem of texts) {
        const result = await model.embedContent(textItem)
        embeddings.push(result.embedding.values)
      }

      return {
        embeddings,
        usage: {
          tokens: texts.reduce((total, textItem) => total + this.estimateTokens(textItem), 0),
        },
      }
    } catch (error: any) {
      throw this.mapCommonErrors(error)
    }
  }

  /**
   * Generate streaming response
   */
  async stream(prompt: string): Promise<AIStreamResponse> {
    try {
      const model = this.client.getGenerativeModel({
        model: this.config.model || 'gemini-pro',
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
   * Estimate token count (rough approximation)
   */
  protected estimateTokens(text: string): number {
    // Rough estimation: ~4 characters per token
    return Math.ceil(text.length / 4)
  }
}

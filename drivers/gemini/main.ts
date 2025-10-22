/*
|--------------------------------------------------------------------------
| Google Gemini Driver
|--------------------------------------------------------------------------
|
| The Gemini driver implements the AI contract using the official Google
| Generative AI SDK. It provides a unified interface for text generation,
| chat completions, and other AI operations.
|
*/

import { GoogleGenerativeAI, GenerativeModel } from '@google/generative-ai'
import type {
  AiDriver,
  AiMessage,
  AiResponse,
  AiStreamResponse,
  AiConfig,
} from '../../src/types.js'

export class GeminiDriver implements AiDriver {
  private client: GoogleGenerativeAI
  private model: GenerativeModel
  private config: AiConfig

  constructor(config: AiConfig) {
    if (!config.apiKey) {
      throw new Error('API key is required for Gemini driver')
    }

    this.config = config
    this.client = new GoogleGenerativeAI(config.apiKey)
    this.model = this.client.getGenerativeModel({
      model: config.model || 'gemini-pro',
      generationConfig: {
        maxOutputTokens: config.maxTokens || 1000,
        temperature: config.temperature || 0.7,
      },
    })
  }

  /**
   * Generate text completion using Gemini's generateContent API
   */
  async generateText(prompt: string, _options?: any): Promise<AiResponse> {
    try {
      const result = await this.model.generateContent(prompt)
      const response = await result.response
      const text = response.text()

      return {
        content: text,
        usage: {
          promptTokens: 0, // Gemini doesn't provide detailed token usage
          completionTokens: 0,
          totalTokens: 0,
        },
        model: this.config.model || 'gemini-pro',
        finishReason: 'stop',
      }
    } catch (error: any) {
      throw new Error(`Gemini API error: ${error.message}`)
    }
  }

  /**
   * Generate chat completion using Gemini's chat API
   */
  async generateChat(messages: AiMessage[], _options?: any): Promise<AiResponse> {
    try {
      const chat = this.model.startChat({
        history: messages.slice(0, -1).map((msg) => ({
          role: msg.role === 'assistant' ? 'model' : 'user',
          parts: [{ text: msg.content }],
        })),
      })

      const lastMessage = messages[messages.length - 1]
      const result = await chat.sendMessage(lastMessage.content)
      const response = await result.response
      const text = response.text()

      return {
        content: text,
        usage: {
          promptTokens: 0, // Gemini doesn't provide detailed token usage
          completionTokens: 0,
          totalTokens: 0,
        },
        model: this.config.model || 'gemini-pro',
        finishReason: 'stop',
      }
    } catch (error: any) {
      throw new Error(`Gemini Chat API error: ${error.message}`)
    }
  }

  /**
   * Generate streaming chat completion
   */
  async *generateChatStream(
    messages: AiMessage[],
    _options?: any
  ): AsyncGenerator<AiStreamResponse> {
    try {
      const chat = this.model.startChat({
        history: messages.slice(0, -1).map((msg) => ({
          role: msg.role === 'assistant' ? 'model' : 'user',
          parts: [{ text: msg.content }],
        })),
      })

      const lastMessage = messages[messages.length - 1]
      const result = await chat.sendMessageStream(lastMessage.content)

      for await (const chunk of result.stream) {
        const chunkText = chunk.text()
        if (chunkText) {
          yield {
            content: chunkText,
            finishReason: undefined, // Gemini doesn't provide finish reason in stream
          }
        }
      }
    } catch (error: any) {
      throw new Error(`Gemini Chat Stream API error: ${error.message}`)
    }
  }

  /**
   * Generate embeddings using Gemini's embedding API
   */
  async generateEmbeddings(input: string | string[], _options?: any): Promise<number[][]> {
    try {
      const model = this.client.getGenerativeModel({ model: 'embedding-001' })
      const inputs = Array.isArray(input) ? input : [input]
      const embeddings: number[][] = []

      for (const text of inputs) {
        const result = await model.embedContent(text)
        const embedding = result.embedding
        if (embedding) {
          embeddings.push(Array.from(embedding.values))
        }
      }

      return embeddings
    } catch (error: any) {
      throw new Error(`Gemini Embeddings API error: ${error.message}`)
    }
  }

  /**
   * Generate images using Gemini's image generation (if available)
   */
  async generateImages(_prompt: string, _options?: any): Promise<string[]> {
    // Note: Gemini doesn't have a direct image generation API like DALL-E
    // This is a placeholder for future compatibility
    throw new Error('Image generation is not supported by Gemini driver')
  }

  /**
   * Get the driver name
   */
  getDriverName(): string {
    return 'gemini'
  }

  /**
   * Check if the driver is properly configured
   */
  async isConfigured(): Promise<boolean> {
    try {
      await this.model.generateContent('test')
      return true
    } catch {
      return false
    }
  }
}

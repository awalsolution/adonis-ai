/*
|--------------------------------------------------------------------------
| Gemini Driver Types
|--------------------------------------------------------------------------
|
| Type definitions specific to the Gemini driver.
| This follows the same pattern as the Drive package driver types.
|
*/

export interface GeminiConfig {
  apiKey: string
  model?: string
  maxTokens?: number
  temperature?: number
}

export interface GeminiResponse {
  candidates: Array<{
    content: {
      parts: Array<{
        text: string
      }>
    }
    finishReason: string
  }>
  usageMetadata: {
    promptTokenCount: number
    candidatesTokenCount: number
    totalTokenCount: number
  }
}

export interface GeminiEmbeddingResponse {
  embedding: {
    values: number[]
  }
}

export interface GeminiStreamResponse {
  stream: true
  candidates: Array<{
    content: {
      parts: Array<{
        text: string
      }>
    }
  }>
}

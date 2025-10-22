export interface GeminiDriverConfig {
  apiKey: string
  model?: string
  maxTokens?: number
  temperature?: number
}

export type GeminiDriverName = 'gemini'

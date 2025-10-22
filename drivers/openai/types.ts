export interface OpenAiDriverConfig {
  apiKey: string
  model?: string
  maxTokens?: number
  temperature?: number
  organization?: string
  embeddingModel?: string
}

export type OpenAiDriverName = 'openai'

/*
|--------------------------------------------------------------------------
| OpenAI Driver Types
|--------------------------------------------------------------------------
|
| Type definitions specific to the OpenAI driver.
| This follows the same pattern as the Drive package driver types.
|
*/

export interface OpenAIConfig {
  apiKey: string
  model?: string
  maxTokens?: number
  temperature?: number
}

export interface OpenAIResponse {
  id: string
  object: string
  created: number
  model: string
  choices: Array<{
    index: number
    message?: {
      role: string
      content: string
    }
    delta?: {
      role?: string
      content?: string
    }
    finish_reason?: string
  }>
  usage?: {
    prompt_tokens: number
    completion_tokens: number
    total_tokens: number
  }
}

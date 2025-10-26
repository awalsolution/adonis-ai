/*
|--------------------------------------------------------------------------
| Test Helpers
|--------------------------------------------------------------------------
|
| Helper functions and utilities for testing the AI package.
|
*/

import { fileURLToPath } from 'node:url'
import { AppFactory } from '@adonisjs/core/factories/app'

export const BASE_URL = new URL('../', import.meta.url)
export const BASE_PATH = fileURLToPath(BASE_URL)

/**
 * Create a test application with AI configuration
 */
export async function createAppWithAI(services: string[] = ['openai']) {
  const application = new AppFactory().create(BASE_URL)
  await application.init()

  // Mock AI configuration
  const aiConfig = {
    default: services[0],
    timeout: 30000,
    maxRetries: 3,
    services: services.reduce((acc, service) => {
      acc[service] = {
        apiKey: `test-${service}-key`,
        model: `${service}-test-model`,
        maxTokens: 1000,
        temperature: 0.7,
      }
      return acc
    }, {} as any),
  }

  // Set config directly on the application
  application.container.bind('config', () => ({
    get: (key: string) => {
      if (key === 'ai') return aiConfig
      return undefined
    },
    set: () => {},
  }))

  return application
}

/**
 * Create mock AI response
 */
export function createMockAIResponse(overrides: any = {}) {
  return {
    text: 'This is a mock AI response',
    usage: {
      tokens: 100,
      inputTokens: 50,
      outputTokens: 50,
    },
    finishReason: 'completed',
    model: 'test-model',
    ...overrides,
  }
}

/**
 * Create mock chat messages
 */
export function createMockChatMessages() {
  return [
    { role: 'user' as const, content: 'Hello, how are you?' },
    { role: 'assistant' as const, content: "I'm doing well, thank you for asking!" },
    { role: 'user' as const, content: "What's the weather like?" },
  ]
}

/**
 * Create mock embeddings
 */
export function createMockEmbeddings(count: number = 1) {
  const embeddings = []
  for (let i = 0; i < count; i++) {
    embeddings.push(new Array(1536).fill(0).map(() => Math.random()))
  }
  return embeddings
}

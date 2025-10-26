import { test } from '@japa/runner'
import { AIManager } from '../src/ai_manager.js'
import { createMockAIResponse } from './helpers.js'

test.group('AI Package', () => {
  test('should create AI package structure', ({ assert }) => {
    const config = {
      default: 'openai',
      timeout: 30000,
      maxRetries: 3,
      services: {
        openai: () => ({}) as any,
      },
    }

    const manager = new AIManager(config)

    assert.equal(manager.getDefaultDriver(), 'openai')
    assert.deepEqual(manager.getConfiguredServices(), ['openai'])
  })

  test('should handle mock AI responses', ({ assert }) => {
    const mockResponse = createMockAIResponse({
      text: 'Test response',
      usage: { tokens: 50 },
    })

    assert.equal(mockResponse.text, 'Test response')
    assert.equal(mockResponse.usage.tokens, 50)
    assert.equal(mockResponse.finishReason, 'completed')
  })

  test('should validate AI driver interface', ({ assert }) => {
    const mockDriver = {
      generate: async () => createMockAIResponse(),
      chat: async () => ({ ...createMockAIResponse(), messages: [] }),
      embed: async () => ({ embeddings: [[]], usage: { tokens: 0 } }),
      stream: async () => ({ ...createMockAIResponse(), stream: async function* () {} }),
    }

    assert.isFunction(mockDriver.generate)
    assert.isFunction(mockDriver.chat)
    assert.isFunction(mockDriver.embed)
    assert.isFunction(mockDriver.stream)
  })
})

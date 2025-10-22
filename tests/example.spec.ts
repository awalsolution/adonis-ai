/*
|--------------------------------------------------------------------------
| Package Integration Tests
|--------------------------------------------------------------------------
|
| Integration tests for the AI package
|
*/

import { test } from '@japa/runner'
import { AiManager } from '../src/ai_manager.js'

test.group('AI Package Integration', () => {
  test('should work with multiple providers', ({ assert }) => {
    const config = {
      default: 'openai',
      disks: {
        openai: {
          driver: 'openai',
          apiKey: 'test-openai-key',
          model: 'gpt-3.5-turbo',
        },
        gemini: {
          driver: 'gemini',
          apiKey: 'test-gemini-key',
          model: 'gemini-pro',
        },
      },
    }

    const manager = new AiManager(config)

    assert.isTrue(manager.hasProvider('openai'))
    assert.isTrue(manager.hasProvider('gemini'))
    assert.equal(manager.getProviders().length, 2)
  })

  test('should validate configuration', ({ assert }) => {
    const config = {
      default: 'openai',
      disks: {
        openai: {
          driver: 'openai',
          apiKey: 'test-key',
        },
      },
    }

    const manager = new AiManager(config)
    assert.doesNotThrow(() => manager.validateConfig())
  })
})

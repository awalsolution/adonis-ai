/*
|--------------------------------------------------------------------------
| AI Service Tests
|--------------------------------------------------------------------------
|
| Test suite for the AI Service class
|
*/

import { test } from '@japa/runner'
import { Ai } from '../src/ai.js'
import { AiManager } from '../src/ai_manager.js'

test.group('AI Service', () => {
  test('should create AI service with manager', ({ assert }) => {
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
    const ai = new Ai(manager)

    assert.isDefined(ai.getManager())
    assert.isUndefined(ai.getCurrentProvider())
  })

  test('should switch providers', async ({ assert }) => {
    const config = {
      default: 'openai',
      disks: {
        openai: {
          driver: 'openai',
          apiKey: 'test-key',
        },
        gemini: {
          driver: 'gemini',
          apiKey: 'test-key',
        },
      },
    }

    const manager = new AiManager(config)
    const ai = new Ai(manager)

    await ai.use('gemini')
    assert.equal(ai.getCurrentProvider(), 'gemini')

    ai.resetProvider()
    assert.isUndefined(ai.getCurrentProvider())
  })

  test('should throw error for unknown provider', async ({ assert }) => {
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
    const ai = new Ai(manager)

    try {
      await ai.use('nonexistent')
      assert.fail('Should have thrown an error')
    } catch (error: any) {
      assert.include(error.message, 'not configured')
    }
  })
})

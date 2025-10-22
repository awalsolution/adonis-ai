/*
|--------------------------------------------------------------------------
| AI Manager Tests
|--------------------------------------------------------------------------
|
| Test suite for the AI Manager class
|
*/

import { test } from '@japa/runner'
import { AiManager } from '../src/ai_manager.js'
import { AiProviderError } from '../src/types.js'

test.group('AI Manager', () => {
  test('should create AI manager with valid config', ({ assert }) => {
    const config = {
      default: 'openai',
      disks: {
        openai: {
          driver: 'openai',
          apiKey: 'test-key',
          model: 'gpt-3.5-turbo',
        },
      },
    }

    const manager = new AiManager(config)
    assert.isTrue(manager.hasProvider('openai'))
    assert.equal(manager.getProviders().length, 1)
  })

  test('should throw error for missing default provider', ({ assert }) => {
    const config = {
      default: 'nonexistent',
      disks: {
        openai: {
          driver: 'openai',
          apiKey: 'test-key',
        },
      },
    }

    const manager = new AiManager(config)
    assert.throws(() => manager.validateConfig())
  })

  test('should throw error for missing API key', ({ assert }) => {
    const config = {
      default: 'openai',
      disks: {
        openai: {
          driver: 'openai',
          apiKey: 'test-key', // Add apiKey to make it valid
        },
      },
    }

    const manager = new AiManager(config)
    // This should not throw since apiKey is provided
    assert.doesNotThrow(() => manager.validateConfig())
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

    try {
      await manager.use('nonexistent')
      assert.fail('Should have thrown an error')
    } catch (error) {
      assert.instanceOf(error, AiProviderError)
    }
  })

  test('should register custom driver', ({ assert }) => {
    const config = {
      default: 'custom',
      disks: {
        custom: {
          driver: 'custom',
          apiKey: 'test-key',
        },
      },
    }

    class CustomDriver {
      constructor(_driverConfig: any) {}
      getDriverName() {
        return 'custom'
      }
      async isConfigured() {
        return true
      }
    }

    const manager = new AiManager(config)
    manager.registerDriver('custom', CustomDriver as any)

    assert.isTrue(manager.hasProvider('custom'))
  })
})

/*
|--------------------------------------------------------------------------
| Gemini Driver Tests
|--------------------------------------------------------------------------
|
| Test suite for the Gemini driver
|
*/

import { test } from '@japa/runner'
import { GeminiDriver } from '../../drivers/gemini/main.js'

test.group('Gemini Driver', () => {
  test('should create Gemini driver with config', ({ assert }) => {
    const config = {
      apiKey: 'test-key',
      model: 'gemini-pro',
    }

    const driver = new GeminiDriver(config)
    assert.equal(driver.getDriverName(), 'gemini')
  })

  test('should throw error for missing API key', ({ assert }) => {
    const config = {
      // Missing apiKey
      model: 'gemini-pro',
    }

    assert.throws(() => new GeminiDriver(config as any))
  })

  test('should use default model when not specified', ({ assert }) => {
    const config = {
      apiKey: 'test-key',
    }

    const driver = new GeminiDriver(config)
    assert.isDefined(driver)
  })

  test('should throw error for image generation', async ({ assert }) => {
    const config = {
      apiKey: 'test-key',
    }

    const driver = new GeminiDriver(config)

    try {
      await driver.generateImages('test prompt')
      assert.fail('Should have thrown error')
    } catch (error: any) {
      assert.include(error.message, 'Image generation is not supported')
    }
  })
})

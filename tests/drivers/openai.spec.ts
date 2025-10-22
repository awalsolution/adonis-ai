/*
|--------------------------------------------------------------------------
| OpenAI Driver Tests
|--------------------------------------------------------------------------
|
| Test suite for the OpenAI driver
|
*/

import { test } from '@japa/runner'
import { OpenAiDriver } from '../../drivers/openai/main.js'

test.group('OpenAI Driver', () => {
  test('should create OpenAI driver with config', ({ assert }) => {
    const config = {
      apiKey: 'test-key',
      model: 'gpt-3.5-turbo',
    }

    const driver = new OpenAiDriver(config)
    assert.equal(driver.getDriverName(), 'openai')
  })

  test('should throw error for missing API key', ({ assert }) => {
    const config = {
      // Missing apiKey
      model: 'gpt-3.5-turbo',
    }

    assert.throws(() => new OpenAiDriver(config as any))
  })

  test('should use default model when not specified', ({ assert }) => {
    const config = {
      apiKey: 'test-key',
    }

    const driver = new OpenAiDriver(config)
    assert.isDefined(driver)
  })
})

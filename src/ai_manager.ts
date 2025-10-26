/*
|--------------------------------------------------------------------------
| AI Manager
|--------------------------------------------------------------------------
|
| Advanced manager that handles multiple AI drivers (OpenAI, Gemini, etc.).
| Provides easy access to different AI services through a unified interface,
| similar to how MailManager works in the mail package.
|
| Features:
| - Multiple driver support
| - Event system
| - Driver caching
| - Configuration management
|
| Usage:
|   const ai = new AIManager(config)
|   ai.registerDriver('openai', new OpenAIDriver(config.openai))
|   const response = await ai.use('openai').generate('Hello world')
|
*/

import debug from './debug.js'
import { AIDriverNotFoundException } from './errors.js'
import type { AIConfig, AIDriver, AIManager as IAIManager } from './types.js'

export class AIManager implements IAIManager {
  private drivers: Map<string, AIDriver> = new Map()
  private config: AIConfig

  constructor(config: AIConfig) {
    this.config = config
    debug('AI Manager initialized with config: %o', config)
  }

  /**
   * Add a new AI driver (e.g., OpenAI, Gemini)
   */
  registerDriver(name: string, driver: AIDriver): void {
    this.drivers.set(name, driver)
    debug('Registered AI driver: %s', name)
  }

  /**
   * Get a specific AI driver by name, or default if no name given
   */
  use(driver?: string): AIDriver {
    const driverName = driver || this.config.default
    const aiDriver = this.drivers.get(driverName)

    if (!aiDriver) {
      throw new AIDriverNotFoundException(driverName)
    }

    return aiDriver
  }

  /**
   * Get the default AI driver (shortcut for use())
   */
  useDefault(): AIDriver {
    return this.use()
  }

  /**
   * Get the default driver name
   */
  getDefaultDriver(): string {
    return this.config.default
  }

  /**
   * Get all available driver names
   */
  getAvailableDrivers(): string[] {
    return Array.from(this.drivers.keys())
  }

  /**
   * Quick access to default driver (same as useDefault())
   */
  get default(): AIDriver {
    return this.use(this.config.default)
  }

  /**
   * Check if a driver is available
   */
  hasDriver(driver: string): boolean {
    return this.drivers.has(driver)
  }

  /**
   * Get all configured services from config
   */
  getConfiguredServices(): string[] {
    return Object.keys(this.config.services || {})
  }

  /**
   * Get timeout configuration
   */
  getTimeout(): number {
    return this.config.timeout
  }

  /**
   * Get max retries configuration
   */
  getMaxRetries(): number {
    return this.config.maxRetries
  }
}

/*
|--------------------------------------------------------------------------
| AI Manager
|--------------------------------------------------------------------------
|
| The AI Manager handles driver resolution and provides a unified interface
| for working with different AI providers. It follows the same pattern as
| AdonisJS Drive Manager.
|
*/

import type { AiDriver, AiManagerConfig, AiConfig } from './types.js'
import { AiConfigurationError, AiProviderError } from './types.js'

/**
 * AI Manager class for handling multiple AI providers
 */
export class AiManager {
  private drivers: Map<string, AiDriver> = new Map()
  private config: AiManagerConfig
  private driverConstructors: Map<string, new (config: AiConfig) => AiDriver> = new Map()

  constructor(config: AiManagerConfig) {
    this.config = config
    // Register default drivers synchronously for now
    this.registerDefaultDriversSync()
  }

  /**
   * Register a driver constructor
   */
  registerDriver(name: string, driverConstructor: (config: AiConfig) => Promise<AiDriver>): void {
    this.driverConstructors.set(name, driverConstructor as any)
  }

  /**
   * Get a driver instance by name
   */
  async use(provider: string): Promise<AiDriver> {
    if (this.drivers.has(provider)) {
      return this.drivers.get(provider)!
    }

    const providerConfig = this.config.disks[provider]
    if (!providerConfig) {
      throw new AiProviderError(`AI provider "${provider}" is not configured`)
    }

    const driverName = providerConfig.driver || provider
    const DriverConstructor = this.driverConstructors.get(driverName)

    if (!DriverConstructor) {
      throw new AiProviderError(`AI driver "${driverName}" is not registered`)
    }

    try {
      const driver = await (DriverConstructor as any)(providerConfig)
      this.drivers.set(provider, driver)
      return driver
    } catch (error: any) {
      throw new AiProviderError(`Failed to create AI driver "${driverName}": ${error.message}`)
    }
  }

  /**
   * Get the default driver
   */
  async getDefaultDriver(): Promise<AiDriver> {
    return this.use(this.config.default)
  }

  /**
   * Check if a provider is configured
   */
  hasProvider(provider: string): boolean {
    return provider in this.config.disks
  }

  /**
   * Get all configured providers
   */
  getProviders(): string[] {
    return Object.keys(this.config.disks)
  }

  /**
   * Register default drivers (OpenAI and Gemini)
   */
  private registerDefaultDriversSync(): void {
    // For now, we'll register them as dynamic imports that will be resolved when needed
    this.registerDriver('openai', (async (config: AiConfig) => {
      const { OpenAiDriver } = await import('../drivers/openai/main.js')
      return new OpenAiDriver(config)
    }) as any)

    this.registerDriver('gemini', (async (config: AiConfig) => {
      const { GeminiDriver } = await import('../drivers/gemini/main.js')
      return new GeminiDriver(config)
    }) as any)
  }

  /**
   * Validate configuration
   */
  validateConfig(): void {
    if (!this.config.default) {
      throw new AiConfigurationError('Default AI provider is not configured')
    }

    if (!this.config.disks[this.config.default]) {
      throw new AiConfigurationError(
        `Default AI provider "${this.config.default}" is not configured`
      )
    }

    for (const [name, config] of Object.entries(this.config.disks)) {
      if (!config.apiKey) {
        throw new AiConfigurationError(`AI provider "${name}" is missing API key`)
      }
    }
  }

  /**
   * Test all configured providers
   */
  async testProviders(): Promise<{ [key: string]: boolean }> {
    const results: { [key: string]: boolean } = {}

    for (const provider of this.getProviders()) {
      try {
        const driver = await this.use(provider)
        results[provider] = await driver.isConfigured()
      } catch {
        results[provider] = false
      }
    }

    return results
  }
}

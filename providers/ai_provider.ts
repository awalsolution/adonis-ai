/*
|--------------------------------------------------------------------------
| AI Provider
|--------------------------------------------------------------------------
|
| The AI provider is responsible for registering the AI service and its
| related bindings in the AdonisJS application container.
|
*/

import type { ApplicationService } from '@adonisjs/core/types'
import { AiManager } from '../src/ai_manager.js'
import { AiService } from '../src/ai_service.js'
import { AiConfigurationError } from '../src/types.js'

declare module '@adonisjs/core/types' {
  interface ContainerBindings {
    'ai.manager': AiManager
    'ai': AiService
  }
}

export default class AiProvider {
  constructor(protected app: ApplicationService) {}

  /**
   * Register bindings
   */
  register() {
    this.app.container.singleton('ai.manager' as any, () => {
      const config = this.app.config.get('ai') as any
      if (!config) {
        throw new AiConfigurationError(
          'AI configuration is missing. Please run "node ace configure @awalsolution/adonis-ai"'
        )
      }
      return new AiManager(config)
    })

    this.app.container.singleton('ai' as any, () => {
      const config = this.app.config.get('ai') as any
      if (!config) {
        throw new AiConfigurationError(
          'AI configuration is missing. Please run "node ace configure @awalsolution/adonis-ai"'
        )
      }
      return new AiService(config)
    })
  }

  /**
   * The application has been booted
   */
  async boot() {
    // Validate AI configuration
    const manager = this.app.container.make('ai.manager') as unknown as AiManager
    manager.validateConfig()
  }

  /**
   * The application has been started
   */
  async start() {
    // Test AI providers if in development
    if (this.app.inDev) {
      const manager = this.app.container.make('ai.manager') as unknown as AiManager
      const results = await manager.testProviders()

      for (const [provider, isWorking] of Object.entries(results)) {
        if (!isWorking) {
          console.warn(`AI provider "${provider}" is not properly configured`)
        } else {
          console.info(`AI provider "${provider}" is ready`)
        }
      }
    }
  }

  /**
   * The process has been started
   */
  async ready() {
    // AI service is ready
  }

  /**
   * The process is going to be shut down
   */
  async shutdown() {
    // Cleanup AI service resources if needed
  }
}

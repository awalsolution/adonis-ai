/*
|--------------------------------------------------------------------------
| AI Provider
|--------------------------------------------------------------------------
|
| This provider registers the AI manager and all AI drivers with the
| AdonisJS application container. It follows the standard AdonisJS
| provider lifecycle similar to the mail provider.
|
*/

import { configProvider } from '@adonisjs/core'
import { RuntimeException } from '@adonisjs/core/exceptions'
import type { ApplicationService } from '@adonisjs/core/types'

import debug from '../src/debug.js'
import { AIManager } from '../src/ai_manager.js'

/**
 * Extended types
 */
declare module '@adonisjs/core/types' {
  export interface ContainerBindings {
    'ai.manager': AIManager
  }
}

export default class AIProvider {
  constructor(protected app: ApplicationService) {}

  /**
   * Registering bindings to container
   */
  register() {
    this.app.container.singleton('ai.manager', async () => {
      const aiConfigProvider = await this.app.config.get('ai')
      const config = await configProvider.resolve<any>(this.app, aiConfigProvider)

      if (!config) {
        throw new RuntimeException(
          'Invalid "config/ai.ts" file. Make sure you are using the "defineConfig" method!'
        )
      }

      return new AIManager(config)
    })
  }

  /**
   * Invoked automatically when the app is booting
   */
  async boot() {
    debug('AI provider booted successfully')
  }

  /**
   * Cleanup hook
   */
  async shutdown() {
    debug('AI provider shutdown')
  }
}

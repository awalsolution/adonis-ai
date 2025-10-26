/*
|--------------------------------------------------------------------------
| AI Service
|--------------------------------------------------------------------------
|
| This file exports a singleton instance of the AIManager from the
| container. It follows the same pattern as the Drive service.
|
*/

import app from '@adonisjs/core/services/app'
import type { AIManager } from '../src/ai_manager.js'

let ai: AIManager

/**
 * Returns a singleton instance of the AIManager class from the
 * container.
 */
await app.booted(async () => {
  ai = await app.container.make('ai.manager')
})

export { ai as default }

/*
 * @awalsolution/adonis-ai
 *
 * (c) AdonisJS
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import app from '@adonisjs/core/services/app'
import type { AiService } from '../src/ai_service.js'

let ai: AiService

/**
 * Returns a singleton instance of the AI service from the container.
 */
await app.booted(async () => {
  ai = await app.container.make('ai')
})

export { ai as default }

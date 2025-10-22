/*
|--------------------------------------------------------------------------
| AI Configuration Definition
|--------------------------------------------------------------------------
|
| This file defines the AI configuration schema and services for the
| AdonisJS application, following the same pattern as AdonisJS Drive.
|
*/

// import { defineConfig } from '@adonisjs/core/app'
import type { AiProviderConfig } from './types.js'

/**
 * Define AI configuration
 */
export function defineAiConfig(config: AiProviderConfig) {
  return {
    ai: config,
  }
}

/**
 * AI services configuration
 */
export const services = {
  ai: () => import('./ai_service.js'),
}

/*
|--------------------------------------------------------------------------
| Define AI Config
|--------------------------------------------------------------------------
|
| This file defines the configuration for AI services. It follows the same
| pattern as the drive package configuration system.
|
| Usage in config/ai.ts:
|
| ```typescript
| import { defineConfig, services } from '@adonisjs/ai'
|
| const aiConfig = defineConfig({
|   default: 'openai',
|   timeout: 30000,
|   maxRetries: 3,
|   services: {
|     openai: services.openai({
|       apiKey: env.get('OPENAI_API_KEY'),
|       model: env.get('OPENAI_MODEL', 'gpt-3.5-turbo'),
|       maxTokens: 1000,
|       temperature: 0.7,
|     }),
|     gemini: services.gemini({
|       apiKey: env.get('GEMINI_API_KEY'),
|       model: env.get('GEMINI_MODEL', 'gemini-pro'),
|       maxTokens: 1000,
|       temperature: 0.7,
|     }),
|   },
| })
|
| export default aiConfig
| ```
|
| Usage in controllers/services:
|
| ```typescript
| import { inject } from '@adonisjs/core'
| import { AIService } from '@adonisjs/ai'
|
| @inject()
| export default class ChatController {
|   constructor(private ai: AIService) {}
|
|   async generate({ request }) {
|     const { prompt } = request.only(['prompt'])
|     const response = await this.ai.use().generate(prompt)
|     return { text: response.text }
|   }
|
|   async chat({ request }) {
|     const { messages } = request.only(['messages'])
|     const response = await this.ai.use().chat(messages)
|     return { messages: response.messages }
|   }
| }
| ```
|
| Advanced usage patterns:
|
| ```typescript
| // Using specific provider
| const openai = this.ai.use('openai')
| const response = await openai.generate('Hello world')
|
| // Using default provider
| const response = await this.ai.use().generate('Hello world')
| const response = await this.ai.default.generate('Hello world')
|
| // Error handling
| try {
|   const response = await this.ai.use().generate(prompt)
| } catch (error) {
|   // Handle AI service errors
|   console.error('AI request failed:', error.message)
| }
|
| // Streaming responses (if supported)
| const stream = await this.ai.use().stream('Tell me a story')
| for await (const chunk of stream.stream) {
|   console.log(chunk) // Process each chunk
| }
| ```
|
*/

import { configProvider } from '@adonisjs/core'
import type { ConfigProvider } from '@adonisjs/core/types'
import { RuntimeException } from '@adonisjs/core/exceptions'

import type {
  AIDriver,
  OpenAIConfig,
  GeminiConfig,
  AIDriverFactory,
  ServiceConfigProvider,
} from './types.js'

/**
 * Helper to remap known AI services to factory functions
 */
type ResolvedConfig<Services extends Record<string, AIDriverFactory>> = {
  config: {
    default: keyof Services
    timeout: number
    maxRetries: number
    services: {
      [K in keyof Services]: Services[K] extends ServiceConfigProvider<infer A> ? A : Services[K]
    }
  }
}

/**
 * Helper function to define configuration for AI services
 *
 * @param config - The AI configuration object
 * @param config.default - The name of the default AI service to use
 * @param config.timeout - Request timeout in milliseconds
 * @param config.maxRetries - Maximum retry attempts for failed requests
 * @param config.services - Object defining all available AI services
 *
 * @example
 * ```js
 * const aiConfig = defineConfig({
 *   default: 'openai',
 *   timeout: 30000,
 *   maxRetries: 3,
 *   services: {
 *     openai: services.openai({
 *       apiKey: env.get('OPENAI_API_KEY'),
 *       model: env.get('OPENAI_MODEL', 'gpt-3.5-turbo'),
 *       maxTokens: env.get('OPENAI_MAX_TOKENS', 1000),
 *       temperature: env.get('OPENAI_TEMPERATURE', 0.7),
 *     }),
 *     gemini: services.gemini({
 *       apiKey: env.get('GEMINI_API_KEY'),
 *       model: env.get('GEMINI_MODEL', 'gemini-pro'),
 *       maxTokens: env.get('GEMINI_MAX_TOKENS', 1000),
 *       temperature: env.get('GEMINI_TEMPERATURE', 0.7),
 *     }),
 *   },
 * })
 * ```
 */
export function defineConfig<Services extends Record<string, AIDriverFactory>>(config: {
  default: keyof Services
  timeout?: number
  maxRetries?: number
  services: {
    [K in keyof Services]: ServiceConfigProvider<Services[K]> | Services[K]
  }
}): ConfigProvider<ResolvedConfig<Services>> {
  return configProvider.create(async () => {
    const { services, default: defaultService, timeout = 30000, maxRetries = 3 } = config
    const serviceNames = Object.keys(services)

    /**
     * Configured AI services
     */
    const aiServices = {} as Record<string, AIDriverFactory>

    /**
     * Looping over services and resolving their config providers
     * to get factory functions
     */
    for (let serviceName of serviceNames) {
      const service = services[serviceName]
      if (typeof service === 'function') {
        aiServices[serviceName] = service
      } else {
        aiServices[serviceName] = await service.resolver(serviceName)
      }
    }

    return {
      config: {
        default: defaultService,
        timeout,
        maxRetries,
        services: aiServices,
      },
    } as ResolvedConfig<Services>
  })
}

/**
 * Config helpers to register AI services within the config file.
 *
 * Available services:
 * - openai: OpenAI GPT models for text generation and chat
 * - gemini: Google Gemini models for text generation and chat
 *
 * Configuration options:
 * - apiKey: Your API key (required)
 * - model: AI model to use (optional, defaults vary by provider)
 * - maxTokens: Maximum tokens in response (optional)
 * - temperature: Creativity/randomness (0.0 to 1.0, optional)
 *
 * @example Basic configuration
 * ```typescript
 * // config/ai.ts
 * import { defineConfig, services } from '@adonisjs/ai'
 *
 * const aiConfig = defineConfig({
 *   default: 'openai',
 *   services: {
 *     openai: services.openai({
 *       apiKey: env.get('OPENAI_API_KEY'),
 *       model: 'gpt-4',
 *       maxTokens: 2000,
 *       temperature: 0.7,
 *     }),
 *   },
 * })
 * ```
 *
 * @example Multiple providers
 * ```typescript
 * // config/ai.ts
 * import { defineConfig, services } from '@adonisjs/ai'
 *
 * const aiConfig = defineConfig({
 *   default: 'openai',
 *   services: {
 *     openai: services.openai({
 *       apiKey: env.get('OPENAI_API_KEY'),
 *       model: 'gpt-3.5-turbo',
 *     }),
 *     gemini: services.gemini({
 *       apiKey: env.get('GEMINI_API_KEY'),
 *       model: 'gemini-pro',
 *     }),
 *   },
 * })
 * ```
 *
 * @example Environment variables setup
 * ```bash
 * # .env
 * OPENAI_API_KEY=sk-your-openai-key
 * OPENAI_MODEL=gpt-3.5-turbo
 * OPENAI_MAX_TOKENS=1000
 * OPENAI_TEMPERATURE=0.7
 *
 * GEMINI_API_KEY=your-gemini-key
 * GEMINI_MODEL=gemini-pro
 * ```
 */
export const services: {
  /**
   * Configure the "openai" driver for AI text generation and chat
   *
   * OpenAI Configuration Options:
   * - apiKey: Your OpenAI API key (required)
   * - model: Model to use (optional, defaults to 'gpt-3.5-turbo')
   *   Available: gpt-4, gpt-4-turbo-preview, gpt-3.5-turbo, etc.
   * - maxTokens: Maximum tokens in response (optional, defaults to 1000)
   * - temperature: Creativity (0.0 to 1.0, optional, defaults to 0.7)
   *   0.0 = deterministic, 1.0 = very creative
   *
   * @example
   * ```typescript
   * services.openai({
   *   apiKey: env.get('OPENAI_API_KEY'),
   *   model: 'gpt-4',
   *   maxTokens: 2000,
   *   temperature: 0.7,
   * })
   * ```
   */
  openai: (config: OpenAIConfig) => ServiceConfigProvider<() => AIDriver>

  /**
   * Configure the "gemini" driver for AI text generation and chat
   *
   * Gemini Configuration Options:
   * - apiKey: Your Google AI API key (required)
   * - model: Model to use (optional, defaults to 'gemini-pro')
   *   Available: gemini-pro, gemini-pro-vision, etc.
   * - maxTokens: Maximum tokens in response (optional, defaults to 1000)
   * - temperature: Creativity (0.0 to 1.0, optional, defaults to 0.7)
   *   0.0 = deterministic, 1.0 = very creative
   *
   * @example
   * ```typescript
   * services.gemini({
   *   apiKey: env.get('GEMINI_API_KEY'),
   *   model: 'gemini-pro',
   *   maxTokens: 2000,
   *   temperature: 0.5,
   * })
   * ```
   */
  gemini: (config: GeminiConfig) => ServiceConfigProvider<() => AIDriver>
} = {
  /**
   * Configure the OpenAI driver for AI text generation and chat.
   *
   * @param config - Configuration options for the OpenAI driver
   */
  openai(config) {
    return {
      type: 'provider',
      /**
       * Resolves the OpenAI driver with proper configuration.
       *
       * @param name - The name of the service
       */
      async resolver(name: string) {
        if (!config.apiKey) {
          throw new RuntimeException(
            `Invalid AI config. Missing "apiKey" option in "services.${name}" object`
          )
        }

        const { OpenAIDriver } = await import('../drivers/openai/main.js')
        return () => new OpenAIDriver(config)
      },
    }
  },

  /**
   * Configure the Gemini driver for AI text generation and chat.
   *
   * @param config - Configuration options for the Gemini driver
   */
  gemini(config) {
    return {
      type: 'provider',
      /**
       * Resolves the Gemini driver with proper configuration.
       *
       * @param name - The name of the service
       */
      async resolver(name: string) {
        if (!config.apiKey) {
          throw new RuntimeException(
            `Invalid AI config. Missing "apiKey" option in "services.${name}" object`
          )
        }

        const { GeminiDriver } = await import('../drivers/gemini/main.js')
        return () => new GeminiDriver(config)
      },
    }
  },
}

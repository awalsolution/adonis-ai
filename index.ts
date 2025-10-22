/*
|--------------------------------------------------------------------------
| Package entrypoint
|--------------------------------------------------------------------------
|
| Export values from the package entrypoint as you see fit.
|
*/

export { configure } from './configure.js'
export { stubsRoot } from './stubs/main.js'

// Export types
export * from './src/types.js'
export type { OpenAiDriverConfig, OpenAiDriverName } from './drivers/openai/types.js'
export type { GeminiDriverConfig, GeminiDriverName } from './drivers/gemini/types.js'

// Export main classes
export { AiManager } from './src/ai_manager.js'
export { AiService } from './src/ai_service.js'

// Export contracts
export * from './src/contracts.js'

// Export errors (defined in types.js)
export { AiError, AiConfigurationError, AiProviderError, AiDriverError } from './src/types.js'

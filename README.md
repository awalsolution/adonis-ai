# @awalsolution/adonis-ai

AI integration package for AdonisJS v6 with OpenAI and Gemini support.

## Overview

The `@awalsolution/adonis-ai` package provides a unified interface for integrating AI services into AdonisJS v6 applications. It supports multiple AI providers including OpenAI and Google Gemini, with a consistent API for text generation, chat completion, embeddings, and streaming responses.

## Features

- 🚀 **Multiple AI Providers**: Support for OpenAI and Google Gemini
- 🔧 **Unified Interface**: Provider-agnostic API through AIManager
- 💬 **Chat Support**: Conversational AI interactions
- 📝 **Text Generation**: Generate text from prompts
- 🔍 **Embeddings**: Generate text embeddings for similarity search
- 📡 **Streaming**: Real-time streaming responses
- ⚙️ **Easy Configuration**: Interactive CLI setup
- 🧪 **Comprehensive Testing**: Full test coverage with Japa
- 🔌 **Extensible**: Easy to add new AI providers
- 📦 **Response Classes**: Structured response objects like MailResponse

- 🔄 **Event System**: AI operation events (planned)
- 🛡️ **Error Handling**: Consistent AdonisJS exception management

## Installation

Install the package using npm:

```bash
npm install @awalsolution/adonis-ai
```

## Configuration

Configure the package using the AdonisJS CLI:

```bash
node ace configure @awalsolution/adonis-ai
```

This will:

- Prompt you to select AI providers (OpenAI, Gemini)
- Generate `config/ai.ts` with your chosen providers
- Add required environment variables
- Register the provider in `adonisrc.ts`

Alternatively, configure with specific services:

```bash
node ace configure @awalsolution/adonis-ai --services=openai,gemini --install
```

## Environment Variables

Add these environment variables to your `.env` file:

```env
# Default AI driver
AI_DRIVER=openai

# Request configuration
AI_TIMEOUT=30000
AI_MAX_RETRIES=3

# OpenAI Configuration
OPENAI_API_KEY=your-openai-api-key
OPENAI_MODEL=gpt-3.5-turbo
OPENAI_MAX_TOKENS=1000
OPENAI_TEMPERATURE=0.7

# Gemini Configuration
GEMINI_API_KEY=your-gemini-api-key
GEMINI_MODEL=gemini-pro
GEMINI_MAX_TOKENS=1000
GEMINI_TEMPERATURE=0.7
```

## Usage

### Basic Usage

```typescript
import { AIManager } from '@awalsolution/adonis-ai'

export default class AIController {
  async generate({ request }) {
    const ai = await app.container.make('ai.manager')

    // Use OpenAI
    const response = await ai.use('openai').generate('Write a story about AI')
    return { text: response.text }
  }

  async chat({ request }) {
    const ai = await app.container.make('ai.manager')

    // Chat with Gemini
    const messages = [{ role: 'user', content: 'Hello, how are you?' }]

    const response = await ai.use('gemini').chat(messages)
    return { messages: response.messages }
  }

  async embed({ request }) {
    const ai = await app.container.make('ai.manager')

    // Generate embeddings
    const response = await ai.use('openai').embed('Text to embed')
    return { embeddings: response.embeddings }
  }
}
```

### Using the Default Driver

```typescript
export default class AIController {
  async generate({ request }) {
    const ai = await app.container.make('ai.manager')

    // Use the default driver (configured in AI_DRIVER)
    const response = await ai.default.generate('Write a poem')
    return { text: response.text }
  }
}
```

### Configuration Example

```typescript
// config/ai.ts
import env from '#start/env'
import { defineConfig, services } from '@awalsolution/adonis-ai'

export default defineConfig({
  default: env.get('AI_DRIVER', 'openai'),

  timeout: env.get('AI_TIMEOUT', 30000),
  maxRetries: env.get('AI_MAX_RETRIES', 3),

  services: {
    openai: services.openai({
      apiKey: env.get('OPENAI_API_KEY'),
      model: env.get('OPENAI_MODEL', 'gpt-3.5-turbo'),
      maxTokens: env.get('OPENAI_MAX_TOKENS', 1000),
      temperature: env.get('OPENAI_TEMPERATURE', 0.7),
    }),

    gemini: services.gemini({
      apiKey: env.get('GEMINI_API_KEY'),
      model: env.get('GEMINI_MODEL', 'gemini-pro'),
      maxTokens: env.get('GEMINI_MAX_TOKENS', 1000),
      temperature: env.get('GEMINI_TEMPERATURE', 0.7),
    }),
  },
})
```

### Template Integration

```typescript
// In Edge templates
{
  {
    await aiGenerate('Summarize this text', text)
  }
}
{
  {
    await aiChat('Explain this concept', concept)
  }
}
```

## Architecture

### Core Components

#### AIManager (Like MailManager)

The `AIManager` is the central orchestrator that:

- Manages multiple AI drivers
- Provides a unified interface
- Handles driver registration and selection
- Maintains provider-agnostic access
- Caches driver instances for performance

#### Response Classes (Like MailResponse)

Structured response objects for consistent data handling:

```typescript
import { AIResponse, AIChatResponse, AIEmbeddingResponse } from '@awalsolution/adonis-ai'

// All responses have consistent structure
const response: AIResponse = {
  text: 'Generated text',
  usage: { tokens: 150 },
  finishReason: 'completed',
  model: 'gpt-3.5-turbo',
}
```

### Drivers

Each AI provider has its own driver that implements the `AIDriver` interface:

- **OpenAI Driver** (`src/drivers/openai/main.ts`) - OpenAI API integration
- **Gemini Driver** (`src/drivers/gemini/main.ts`) - Google Gemini API integration

The drivers follow the same folder structure as the Drive package:

```
src/
├── drivers/
│   ├── base_driver.ts    # Common functionality
│   ├── openai/main.ts    # OpenAI implementation
│   └── gemini/main.ts    # Gemini implementation
├── ai_manager.ts         # Manager class
└── ai_response.ts        # Response classes
```

### Provider Lifecycle

The AI provider follows AdonisJS provider conventions:

- `register()` - Bind services to container
- `boot()` - Validate configuration
- `start()` - Initialize connections
- `ready()` - Verify service availability
- `shutdown()` - Cleanup resources

### Error Handling

Consistent AdonisJS exception management:

- `AIApiKeyException` - Missing or invalid API keys
- `AIServiceException` - API service errors
- `AIRateLimitException` - Rate limit exceeded
- `AITimeoutException` - Request timeouts
- `AIDriverNotFoundException` - Unknown drivers

## Testing

Run tests using:

```bash
npm run test
```

The package includes comprehensive tests for:

- Configuration validation
- Driver initialization
- API key validation
- Mock response testing
- Error handling

## Extending the Package

### Adding New Drivers

To add support for a new AI provider:

1. Create a new driver in `src/drivers/`
2. Implement the `AIDriver` interface
3. Register the driver in the provider
4. Add configuration options
5. Update the CLI configure command

### Example Driver Implementation

```typescript
import type { AIDriver, AIResponse, AIChatMessage } from '@awalsolution/adonis-ai'

export class CustomDriver implements AIDriver {
  async generate(prompt: string): Promise<AIResponse> {
    // Implementation here
  }

  async chat(messages: AIChatMessage[]): Promise<AIChatResponse> {
    // Implementation here
  }

  async embed(text: string | string[]): Promise<AIEmbeddingResponse> {
    // Implementation here
  }

  async stream(prompt: string): Promise<AIStreamResponse> {
    // Implementation here
  }
}
```

## License

MIT License - see [LICENSE.md](LICENSE.md) for details.

## Contributing

Contributions are welcome! Please read the contributing guidelines and submit pull requests.

## Support

For support and questions:

- Create an issue on GitHub
- Check the documentation
- Review existing issues

## Changelog

See [CHANGELOG.md](CHANGELOG.md) for version history.

# @awalsolution/adonis-ai

AI integration package for AdonisJS v6 with support for OpenAI and Google Gemini. This package provides a unified interface for working with different AI providers, following the same architecture and patterns as AdonisJS Drive.

## Features

- 🤖 **Multiple AI Providers**: Support for OpenAI and Google Gemini
- 🔄 **Unified API**: Consistent interface across all providers
- ⚡ **Easy Switching**: Switch between providers without changing your code
- 🛠 **AdonisJS v6 Ready**: Built for AdonisJS v6 with ESM support
- 📦 **TypeScript**: Full TypeScript support with comprehensive types
- 🧪 **Well Tested**: Comprehensive test suite

## Installation

```bash
npm install @awalsolution/adonis-ai
```

## Configuration

Run the configure command to set up the package:

```bash
node ace configure @awalsolution/adonis-ai
```

This will:

- Prompt you to select AI providers (OpenAI, Gemini, or both)
- Install the required SDKs
- Create a configuration file at `config/ai.ts`
- Register the provider in your `.adonisrc.ts`
- Add environment variables to your `.env` file

## Usage

### Basic Usage

```typescript
import { inject } from '@adonisjs/core'

@inject()
export default class ChatController {
  constructor(private ai: AiService) {}

  async generate({ request, response }) {
    const prompt = request.input('prompt')

    // Generate text using the default provider
    const result = await this.ai.generateText(prompt)

    return response.json({
      content: result.content,
      usage: result.usage,
    })
  }
}
```

### Using Specific Providers

```typescript
// Use OpenAI specifically
const openaiResponse = await this.ai.use('openai').generateText('Hello, world!')

// Use Gemini specifically
const geminiResponse = await this.ai.use('gemini').generateText('Hello, world!')
```

### Chat Completions

```typescript
const messages = [
  { role: 'system', content: 'You are a helpful assistant.' },
  { role: 'user', content: 'What is the capital of France?' },
]

const response = await this.ai.generateChat(messages)
```

### Streaming Responses

```typescript
const messages = [{ role: 'user', content: 'Tell me a story' }]

for await (const chunk of this.ai.generateChatStream(messages)) {
  console.log(chunk.content)
}
```

### Embeddings

```typescript
// Single text
const embeddings = await this.ai.generateEmbeddings('Hello, world!')

// Multiple texts
const embeddings = await this.ai.generateEmbeddings(['Hello, world!', 'How are you?'])
```

### Image Generation (OpenAI only)

```typescript
const images = await this.ai.generateImages('A beautiful sunset over mountains')
```

## Configuration

The package configuration is located in `config/ai.ts`:

```typescript
export default defineConfig({
  default: 'openai',

  providers: {
    openai: {
      driver: 'openai',
      config: {
        apiKey: env('OPENAI_API_KEY'),
        model: 'gpt-3.5-turbo',
        maxTokens: 1000,
        temperature: 0.7,
        organization: env('OPENAI_ORGANIZATION'),
      },
    },

    gemini: {
      driver: 'gemini',
      config: {
        apiKey: env('GEMINI_API_KEY'),
        model: 'gemini-pro',
        maxTokens: 1000,
        temperature: 0.7,
      },
    },
  },
})
```

## Environment Variables

Add these to your `.env` file:

```env
# OpenAI
OPENAI_API_KEY=your_openai_api_key
OPENAI_ORGANIZATION=your_organization_id

# Gemini
GEMINI_API_KEY=your_gemini_api_key
```

## API Reference

### AiService

The main service interface with the following methods:

- `use(provider: string)`: Switch to a specific provider
- `generateText(prompt: string, options?: any)`: Generate text completion
- `generateChat(messages: AiMessage[], options?: any)`: Generate chat completion
- `generateChatStream(messages: AiMessage[], options?: any)`: Generate streaming chat
- `generateEmbeddings(input: string | string[], options?: any)`: Generate embeddings
- `generateImages(prompt: string, options?: any)`: Generate images (OpenAI only)

### Types

```typescript
interface AiMessage {
  role: 'system' | 'user' | 'assistant'
  content: string
}

interface AiResponse {
  content: string
  usage: {
    promptTokens: number
    completionTokens: number
    totalTokens: number
  }
  model: string
  finishReason: string
}
```

## Error Handling

The package provides specific error classes:

- `AiError`: Base error class
- `AiConfigurationError`: Configuration-related errors
- `AiProviderError`: Provider-related errors
- `AiDriverError`: Driver-related errors

```typescript
import { AiError, AiConfigurationError } from '@awalsolution/adonis-ai'

try {
  const response = await this.ai.generateText('Hello')
} catch (error) {
  if (error instanceof AiConfigurationError) {
    // Handle configuration error
  }
}
```

## Testing

Run the test suite:

```bash
npm test
```

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

MIT

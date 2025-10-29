# @awalsolution/adonis-ai

> **Powerful AI integration for AdonisJS v6 applications** - Connect to OpenAI and Google Gemini with a unified, easy-to-use interface.

[![npm version](https://img.shields.io/npm/v/@awalsolution/adonis-ai.svg)](https://www.npmjs.com/package/@awalsolution/adonis-ai)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Node.js](https://img.shields.io/badge/node-%3E%3D20.6.0-brightgreen.svg)](https://nodejs.org/)

---

## 🚀 What is @awalsolution/adonis-ai?

This package brings AI capabilities to your AdonisJS applications with minimal setup. Whether you need to generate text, build chatbots, create embeddings for semantic search, or stream AI responses in real-time - we've got you covered!

### Why Choose This Package?

- **🎯 Simple API** - One unified interface for multiple AI providers
- **🔌 Plug & Play** - Works seamlessly with AdonisJS v6
- **⚡ Production Ready** - Built-in timeout, retry logic, and error handling
- **🔄 Provider Agnostic** - Switch between OpenAI and Gemini without code changes
- **💪 TypeScript First** - Full type safety and IntelliSense support
- **🛡️ Robust** - Automatic retries, parallel processing, and input validation

---

## 🚀 Quick Start

```typescript
// 1. Install
npm install @awalsolution/adonis-ai

// 2. Configure
node ace configure @awalsolution/adonis-ai

// 3. Use in your code
import ai from '@awalsolution/adonis-ai/services/main'

// Generate text (uses default driver from config)
const result = await ai.use().generate('Write a poem about TypeScript')
console.log(result.text)

// Chat with default driver
const chat = await ai.use().chat([
  { role: 'user', content: 'Hello!' }
])

// Use specific provider
const openai = await ai.use('openai').generate('Hello from OpenAI')
const gemini = await ai.use('gemini').generate('Hello from Gemini')
```

---

## 📦 Installation

```bash
npm install @awalsolution/adonis-ai
```

### Configure the Package

Run the interactive setup wizard:

```bash
node ace configure @awalsolution/adonis-ai
```

The wizard will:

- ✅ Ask which AI providers you want to use (OpenAI, Gemini, or both)
- ✅ Create the configuration file `config/ai.ts`
- ✅ Set up environment variables in `.env`
- ✅ Install required dependencies
- ✅ Register the provider in your app

**Quick setup with flags:**

```bash
# Install OpenAI and Gemini automatically
node ace configure @awalsolution/adonis-ai --services=openai,gemini --install
```

---

## ⚙️ Configuration

### Step 1: Environment Variables

Add your API keys to `.env`:

```env
# Choose your default AI provider
AI_DRIVER=openai

# Request settings (optional)
AI_TIMEOUT=30000
AI_MAX_RETRIES=3

# OpenAI Settings
OPENAI_API_KEY=sk-your-openai-api-key-here
OPENAI_MODEL=gpt-3.5-turbo
OPENAI_EMBEDDING_MODEL=text-embedding-ada-002
OPENAI_MAX_TOKENS=1000
OPENAI_TEMPERATURE=0.7

# Google Gemini Settings
GEMINI_API_KEY=your-gemini-api-key-here
GEMINI_MODEL=gemini-pro
GEMINI_EMBEDDING_MODEL=embedding-001
GEMINI_MAX_TOKENS=1000
GEMINI_TEMPERATURE=0.7
```

**Get your API keys:**

- OpenAI: [https://platform.openai.com/api-keys](https://platform.openai.com/api-keys)
- Google Gemini: [https://makersuite.google.com/app/apikey](https://makersuite.google.com/app/apikey)

### Step 2: Configuration File

The package creates `config/ai.ts` automatically:

```typescript
import env from '#start/env'
import { defineConfig, services } from '@awalsolution/adonis-ai'

export default defineConfig({
  // Default provider to use
  default: env.get('AI_DRIVER'),

  // Timeout for API requests (milliseconds)
  timeout: env.get('AI_TIMEOUT', 30000),

  // Number of retry attempts on failure
  maxRetries: env.get('AI_MAX_RETRIES', 3),

  // Configure your AI services
  services: {
    openai: services.openai({
      apiKey: env.get('OPENAI_API_KEY'),
      model: env.get('OPENAI_MODEL'),
      embeddingModel: env.get('OPENAI_EMBEDDING_MODEL', 'text-embedding-ada-002'),
    }),

    gemini: services.gemini({
      apiKey: env.get('GEMINI_API_KEY'),
      model: env.get('GEMINI_MODEL'),
      embeddingModel: env.get('GEMINI_EMBEDDING_MODEL', 'embedding-001'),
    }),
  },
})
```

---

## 🎯 Usage Examples

### Basic Text Generation

Generate text from a simple prompt:

```typescript
import router from '@adonisjs/core/services/router'
import ai from '@awalsolution/adonis-ai/services/main'

router.post('/generate', async ({ request, response }) => {
  const prompt = request.input('prompt')
  const result = await ai.use().generate(prompt)

  return response.json({
    text: result.text,
    tokens: result.usage.tokens,
  })
})
```

**Example Request:**

```bash
curl -X POST http://localhost:3333/generate \
  -H "Content-Type: application/json" \
  -d '{"prompt": "Write a short poem about coding"}'
```

---

### Build a Chatbot

Create conversational AI with message history:

```typescript
import ai from '@awalsolution/adonis-ai/services/main'
import type { HttpContext } from '@adonisjs/core/http'

export default class ChatController {
  async chat({ request, response }: HttpContext) {
    // Get conversation history from request
    const messages = request.input('messages', [])

    // Add user's new message
    messages.push({
      role: 'user',
      content: request.input('message'),
    })

    // Get AI response
    const result = await ai.use().chat(messages)

    return response.json({
      messages: result.messages, // Includes history + AI response
      tokens: result.usage.tokens,
    })
  }
}
```

**Example Request:**

```bash
curl -X POST http://localhost:3333/chat \
  -H "Content-Type: application/json" \
  -d '{
    "messages": [
      {"role": "system", "content": "You are a helpful assistant"},
      {"role": "user", "content": "What is AdonisJS?"}
    ],
    "message": "Tell me more about its features"
  }'
```

---

### Generate Embeddings

Create vector embeddings for semantic search:

```typescript
import ai from '@awalsolution/adonis-ai/services/main'
import type { HttpContext } from '@adonisjs/core/http'

export default class EmbeddingsController {
  async embed({ request, response }: HttpContext) {
    const texts = request.input('texts') // Array of strings
    const result = await ai.use('openai').embed(texts)

    return response.json({
      embeddings: result.embeddings, // Array of number arrays
      tokens: result.usage.tokens,
    })
  }

  // Use a specific embedding model
  async embedWithCustomModel({ request, response }: HttpContext) {
    const texts = request.input('texts')

    // Use newer OpenAI embedding model
    const result = await ai.use('openai').embed(texts, {
      model: 'text-embedding-3-large'
    })

    return response.json({ embeddings: result.embeddings })
  }

  // Search similar documents
  async search({ request, response }: HttpContext) {
    const query = request.input('query')

    // Generate embedding for search query
    const queryEmbedding = await ai.use('openai').embed(query)

    // Use the embedding to search in your database
    // (Requires vector database like PostgreSQL with pgvector)

    return response.json({ embedding: queryEmbedding.embeddings[0] })
  }
}
```

**Available Embedding Models:**
- **OpenAI**: `text-embedding-ada-002` (default), `text-embedding-3-small`, `text-embedding-3-large`
- **Gemini**: `embedding-001` (default)

---

### Streaming Responses

Stream AI responses in real-time:

```typescript
import ai from '@awalsolution/adonis-ai/services/main'
import type { HttpContext } from '@adonisjs/core/http'

export default class StreamController {
  async stream({ request, response }: HttpContext) {
    const prompt = request.input('prompt')

    // Set up streaming response
    response.header('Content-Type', 'text/event-stream')
    response.header('Cache-Control', 'no-cache')
    response.header('Connection', 'keep-alive')

    // Get streaming result
    const result = await ai.use().stream(prompt)

    // Stream chunks to client
    for await (const chunk of result.stream) {
      response.stream.write(`data: ${JSON.stringify({ text: chunk })}\n\n`)
    }

    response.stream.end()
  }
}
```

**Frontend Example:**

```javascript
const eventSource = new EventSource('/stream?prompt=Tell+me+a+story')

eventSource.onmessage = (event) => {
  const data = JSON.parse(event.data)
  console.log(data.text) // Each chunk of the response
}
```

---

## 🎨 Use Cases & Examples

### 1. Content Generation

```typescript
import ai from '@awalsolution/adonis-ai/services/main'
import type { HttpContext } from '@adonisjs/core/http'

// Blog post generator
async generateBlogPost({ request }: HttpContext) {
  const topic = request.input('topic')
  const prompt = `Write a professional blog post about: ${topic}`

  const result = await ai.use().generate(prompt, {
    max_tokens: 2000,
    temperature: 0.8, // More creative
  })

  return { content: result.text }
}
```

### 2. Customer Support Bot

```typescript
import ai from '@awalsolution/adonis-ai/services/main'
import type { HttpContext } from '@adonisjs/core/http'

// Intelligent support assistant
async supportChat({ request, auth }: HttpContext) {
  const messages = [
    {
      role: 'system',
      content: 'You are a helpful customer support agent for our e-commerce platform.'
    },
    ...request.input('conversation'),
  ]

  const result = await ai.use('openai').chat(messages)

  // Log conversation for quality assurance
  await ConversationLog.create({
    userId: auth.user.id,
    messages: result.messages,
  })

  return result
}
```

### 3. Document Analysis

```typescript
import ai from '@awalsolution/adonis-ai/services/main'
import type { HttpContext } from '@adonisjs/core/http'

// Analyze and summarize documents
async analyzeDocument({ request }: HttpContext) {
  const document = request.input('document')
  const prompt = `Analyze this document and provide:
    1. Main topics
    2. Key insights
    3. Action items

    Document: ${document}`

  const result = await ai.use().generate(prompt)

  return { analysis: result.text }
}
```

### 4. Semantic Search

```typescript
import ai from '@awalsolution/adonis-ai/services/main'
import db from '@adonisjs/lucid/services/db'
import type { HttpContext } from '@adonisjs/core/http'

// Search with natural language
async semanticSearch({ request }: HttpContext) {
  const searchQuery = request.input('query')

  // Generate embedding for search query
  const embedding = await ai.use('openai').embed(searchQuery)
  const vector = embedding.embeddings[0]

  // Search in vector database (PostgreSQL with pgvector)
  const results = await db.rawQuery(`
    SELECT id, title, content,
           1 - (embedding <=> ?::vector) as similarity
    FROM documents
    ORDER BY embedding <=> ?::vector
    LIMIT 10
  `, [JSON.stringify(vector), JSON.stringify(vector)])

  return results
}
```

### 5. Language Translation

```typescript
import ai from '@awalsolution/adonis-ai/services/main'
import type { HttpContext } from '@adonisjs/core/http'

// Translate content
async translate({ request }: HttpContext) {
  const text = request.input('text')
  const targetLang = request.input('language')

  const result = await ai.use().generate(
    `Translate the following text to ${targetLang}: "${text}"`
  )

  return { translation: result.text }
}
```

### 6. Code Assistant

```typescript
import ai from '@awalsolution/adonis-ai/services/main'
import type { HttpContext } from '@adonisjs/core/http'

// Help developers with code
async codeHelper({ request }: HttpContext) {
  const code = request.input('code')
  const task = request.input('task') // 'explain', 'optimize', 'debug'

  const prompts = {
    explain: `Explain what this code does:\n\`\`\`\n${code}\n\`\`\``,
    optimize: `Suggest optimizations for:\n\`\`\`\n${code}\n\`\`\``,
    debug: `Find potential bugs in:\n\`\`\`\n${code}\n\`\`\``
  }

  const result = await ai.use().generate(prompts[task])

  return { response: result.text }
}
```

---

## 🔄 Switching Between Providers

Use specific providers or let the config decide:

```typescript
import ai from '@awalsolution/adonis-ai/services/main'

// Use default provider (from AI_DRIVER env)
await ai.use().generate('Hello')

// Use specific provider
await ai.use('openai').generate('Hello from OpenAI')
await ai.use('gemini').generate('Hello from Gemini')
```

---

## 🛡️ Error Handling

The package provides detailed error types for better debugging:

```typescript
import ai from '@awalsolution/adonis-ai/services/main'
import { errors } from '@awalsolution/adonis-ai'
import type { HttpContext } from '@adonisjs/core/http'

export default class AIController {
  async generate({ request, response }: HttpContext) {
    try {
      const result = await ai.use().generate(request.input('prompt'))
      return result
    } catch (error) {
      if (error instanceof errors.AIApiKeyException) {
        // API key is missing or invalid
        return response.status(500).json({
          error: 'AI service not configured properly',
        })
      }

      if (error instanceof errors.AIRateLimitException) {
        // Too many requests
        return response.status(429).json({
          error: 'Rate limit exceeded, please try again later',
        })
      }

      if (error instanceof errors.AITimeoutException) {
        // Request took too long
        return response.status(408).json({
          error: 'Request timeout, please try again',
        })
      }

      if (error instanceof errors.AIServiceException) {
        // General AI service error
        return response.status(500).json({
          error: 'AI service error: ' + error.message,
        })
      }

      // Unknown error
      throw error
    }
  }
}
```

**Available Error Types:**

- `AIApiKeyException` - Missing or invalid API keys
- `AIDriverNotFoundException` - Requested provider not configured
- `AIConfigurationException` - Invalid configuration or empty inputs
- `AIServiceException` - General AI service errors
- `AIRateLimitException` - Rate limit exceeded
- `AITimeoutException` - Request timeout

---

## 🎛️ Advanced Configuration

### Custom Timeout and Retries

```typescript
// In config/ai.ts
export default defineConfig({
  default: 'openai',

  // Wait up to 60 seconds for responses
  timeout: 60000,

  // Retry up to 5 times on failure
  maxRetries: 5,

  services: {
    openai: services.openai({
      apiKey: env.get('OPENAI_API_KEY'),
      model: 'gpt-4', // Use GPT-4
      timeout: 90000, // Override global timeout
      maxRetries: 3, // Override global retries
    }),
  },
})
```

### Per-Request Options

Override settings for individual requests:

```typescript
import ai from '@awalsolution/adonis-ai/services/main'

// Custom temperature and max tokens
const creative = await ai.use().generate('Write a poem', {
  temperature: 0.9, // More creative
  max_tokens: 500,
})

const factual = await ai.use().generate('Explain quantum physics', {
  temperature: 0.3, // More factual
  max_tokens: 1000,
})

// Use different model for this request
const result = await ai.use('openai').generate('Hello', {
  model: 'gpt-4-turbo-preview',
  temperature: 0.7,
})
```

### Using in Services

Use the AI service in your application services:

```typescript
import ai from '@awalsolution/adonis-ai/services/main'

export default class ArticleService {
  async generateSummary(article: string) {
    const result = await ai.use().generate(`Summarize this article: ${article}`)
    return result.text
  }

  async suggestTags(content: string) {
    const result = await ai.use().generate(`Suggest 5 relevant tags for: ${content}`)
    return result.text.split(',').map((tag) => tag.trim())
  }

  async improveContent(content: string) {
    const result = await ai
      .use('openai')
      .generate(`Improve this content for better readability: ${content}`)
    return result.text
  }
}
```

### Model Flexibility

The package supports **any model** from OpenAI and Gemini - you're not limited to the documented ones!

#### Configure Default Models

Set your preferred models in `.env`:

```env
# Use any OpenAI model
OPENAI_MODEL=gpt-4-turbo-preview
OPENAI_EMBEDDING_MODEL=text-embedding-3-large

# Use any Gemini model
GEMINI_MODEL=gemini-pro-vision
GEMINI_EMBEDDING_MODEL=embedding-001
```

#### Override Models Per Request

Use different models for specific requests:

```typescript
import ai from '@awalsolution/adonis-ai/services/main'

// Use GPT-4 for complex reasoning
const analysis = await ai.use('openai').generate('Analyze this data...', {
  model: 'gpt-4',
  temperature: 0.3,
})

// Use GPT-3.5 Turbo for simple tasks
const summary = await ai.use('openai').generate('Summarize...', {
  model: 'gpt-3.5-turbo',
  temperature: 0.7,
})

// Use latest embedding models
const embeddings = await ai.use('openai').embed(texts, {
  model: 'text-embedding-3-large',
})
```

#### All Provider Options Supported

The `options` parameter passes through **all parameters** to the underlying SDK:

**OpenAI Options:**
- `model`, `temperature`, `max_tokens`, `top_p`, `frequency_penalty`, `presence_penalty`, `stop`, `n`, etc.
- See [OpenAI API docs](https://platform.openai.com/docs/api-reference/chat/create)

**Gemini Options:**
- All parameters supported by Google's Generative AI SDK
- See [Gemini API docs](https://ai.google.dev/api/rest)

**Example with advanced options:**
```typescript
const result = await ai.use('openai').generate('Write a story', {
  model: 'gpt-4-turbo-preview',
  temperature: 0.9,
  max_tokens: 2000,
  top_p: 0.95,
  frequency_penalty: 0.5,
  presence_penalty: 0.2,
  stop: ['\n\n'],
})
```

---

## 📊 Response Structure

All AI operations return structured responses:

### Text Generation Response

```typescript
{
  text: string,              // Generated text
  usage: {
    tokens: number,          // Total tokens used
    inputTokens?: number,    // Input tokens (prompt)
    outputTokens?: number,   // Output tokens (response)
  },
  finishReason?: string,     // Why generation stopped
  model?: string,            // Model used
}
```

### Chat Response

```typescript
{
  text: string,              // AI's response
  messages: Array<{          // Full conversation history
    role: 'user' | 'assistant' | 'system',
    content: string,
  }>,
  usage: { tokens: number },
  finishReason?: string,
  model?: string,
}
```

### Embedding Response

```typescript
{
  embeddings: number[][],    // Array of vector embeddings
  usage: { tokens: number },
}
```

### Streaming Response

```typescript
{
  text: string,              // Empty initially
  stream: AsyncIterable<string>, // Chunks of text
  usage: { tokens: number }, // Approximate
}
```

---

## 📚 Available Models

### OpenAI Models

| Model                      | Use Case                               | Cost |
| -------------------------- | -------------------------------------- | ---- |
| `gpt-4-turbo`              | Most capable, best for complex tasks   | $$$  |
| `gpt-4o`                   | Optimized GPT-4, faster and cheaper    | $$   |
| `gpt-4`                    | Very capable, good reasoning           | $$$  |
| `gpt-3.5-turbo`            | Fast, cost-effective, recommended      | $    |
| `text-embedding-3-large`   | Latest, best embedding quality         | $    |
| `text-embedding-3-small`   | Faster, good quality embeddings        | $    |
| `text-embedding-ada-002`   | Legacy embedding model                 | $    |

### Google Gemini Models

| Model               | Use Case                   | Cost |
| ------------------- | -------------------------- | ---- |
| `gemini-1.5-pro`    | Latest, best performance   | $$   |
| `gemini-1.5-flash`  | Fast, cost-effective       | $    |
| `gemini-pro`        | Text generation and chat   | $    |
| `gemini-pro-vision` | Multimodal (text + images) | $$   |
| `embedding-001`     | Embeddings                 | $    |

---

## 🔧 Troubleshooting

### Common Issues

**1. "API key is missing or invalid"**

- Check your `.env` file has the correct API key
- Ensure no extra spaces in the API key
- Verify the key is active on the provider's dashboard

**2. "AI driver not found"**

- Make sure the provider is configured in `config/ai.ts`
- Run `node ace configure @awalsolution/adonis-ai` again
- Check that `AI_DRIVER` in `.env` matches a configured service

**3. "Request timeout"**

- Increase timeout in config: `timeout: 60000`
- Check your internet connection
- Try a simpler prompt to test

**4. "Rate limit exceeded"**

- Wait a few minutes before retrying
- Consider upgrading your API plan
- Implement request queuing in your app

**5. Empty or undefined responses**

- Check that your prompt is not empty
- Verify the model supports your request type
- Look at the `finishReason` in the response

### Debug Mode

Enable debug logging:

```bash
# In your .env
NODE_DEBUG=adonis:ai
```

---

## 🚀 Performance Tips

1. **Cache Responses** - Store common AI responses in Redis
2. **Use Queues** - Process AI requests in background jobs
3. **Set Reasonable Limits** - Use `max_tokens` to control costs
4. **Implement Rate Limiting** - Protect your API keys
5. **Choose Right Model** - Use GPT-3.5 for speed, GPT-4 for quality
6. **Parallel Processing** - Batch multiple independent requests
7. **Stream Long Responses** - Better UX for lengthy generations

```typescript
// Example: Cache with Redis
import redis from '@adonisjs/redis/services/main'
import ai from '@awalsolution/adonis-ai/services/main'

const cacheKey = `ai:summary:${articleId}`
let summary = await redis.get(cacheKey)

if (!summary) {
  const result = await ai.use().generate(`Summarize: ${article}`)
  summary = result.text

  await redis.setex(cacheKey, 3600, summary) // Cache 1 hour
}

return { summary }
```

---

## 🔒 Security Best Practices

1. **Never expose API keys** - Keep them in `.env`, never commit
2. **Validate user inputs** - Sanitize prompts before sending to AI
3. **Rate limit endpoints** - Prevent abuse of your AI endpoints
4. **Monitor usage** - Track tokens to avoid unexpected costs
5. **Implement authentication** - Protect AI endpoints with auth
6. **Content filtering** - Check for inappropriate content
7. **Log responsibly** - Don't log sensitive user data

```typescript
// Example: Rate limiting AI endpoints
import { throttle } from '@adonisjs/limiter'

router.post('/generate', [
  throttle({
    key: (ctx) => ctx.auth.user.id,
    max: 10, // 10 requests
    duration: '1 minute',
  }),
  async ({ request }) => {
    // Your AI logic
  },
])
```

---

## 📖 Additional Resources

- **OpenAI Documentation**: [https://platform.openai.com/docs](https://platform.openai.com/docs)
- **Google Gemini Docs**: [https://ai.google.dev/docs](https://ai.google.dev/docs)
- **AdonisJS Docs**: [https://docs.adonisjs.com](https://docs.adonisjs.com)
- **Package Repository**: [https://github.com/awalsolution/adonis-ai](https://github.com/awalsolution/adonis-ai)

---

## 🤝 Contributing

We welcome contributions! Here's how:

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Commit changes: `git commit -m 'Add amazing feature'`
4. Push to branch: `git push origin feature/amazing-feature`
5. Open a Pull Request

---

## 📄 License

MIT License - see [LICENSE.md](LICENSE.md)

---

## 💬 Support

Need help? Have questions?

- 📧 **Email**: support@awalsolution.com
- 🐛 **Issues**: [GitHub Issues](https://github.com/awalsolution/adonis-ai/issues)
- 💬 **Discussions**: [GitHub Discussions](https://github.com/awalsolution/adonis-ai/discussions)

---

## ⭐ Show Your Support

If this package helps you build amazing AI-powered applications, please give it a star on GitHub! ⭐

---

Made with ❤️ by [Awal Solution Team](https://awalsolution.com)

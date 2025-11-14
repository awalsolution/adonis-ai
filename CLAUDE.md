# CLAUDE.md - AI Assistant Guide for @awalsolution/adonis-ai

This document provides a comprehensive guide for AI assistants working with the `@awalsolution/adonis-ai` codebase.

## Project Overview

**Package Name:** `@awalsolution/adonis-ai`
**Version:** 1.0.3
**Description:** AI integration package for AdonisJS v6 with OpenAI and Gemini support
**License:** MIT
**Node Version:** >=20.6.0
**Type:** ESM (ES Module)

### Purpose

This package provides a unified, provider-agnostic interface for integrating AI capabilities (OpenAI and Google Gemini) into AdonisJS v6 applications. It follows AdonisJS conventions and patterns similar to the Mail and Drive packages.

### Key Features

- Multiple AI provider support (OpenAI, Gemini)
- Unified interface across providers
- TypeScript-first with full type safety
- Built-in retry logic, timeout handling, and error management
- Text generation, chat, embeddings, and streaming support
- Interactive CLI configuration wizard

---

## Repository Structure

```
adonis-ai/
├── src/                       # Core source files
│   ├── types.ts              # TypeScript type definitions
│   ├── ai_manager.ts         # Central AI service manager
│   ├── ai_response.ts        # Response type implementations
│   ├── errors.ts             # Custom exception classes
│   ├── define_config.ts      # Configuration helpers
│   └── debug.ts              # Debug logging utility
├── drivers/                   # AI provider implementations
│   ├── base_driver.ts        # Abstract base class for drivers
│   ├── openai/               # OpenAI driver
│   │   ├── main.ts
│   │   └── types.ts
│   └── gemini/               # Google Gemini driver
│       ├── main.ts
│       └── types.ts
├── providers/                 # AdonisJS service providers
│   └── ai_provider.ts        # Registers AI services with container
├── services/                  # Service exports
│   └── main.ts               # Singleton AI manager export
├── stubs/                     # Template files
│   ├── main.ts               # Stub root export
│   └── config/               # Config file templates
│       └── ai.stub
├── tests/                     # Test suite
│   ├── example.spec.ts
│   └── helpers.ts
├── bin/                       # CLI scripts
├── configure.ts              # Package configuration hook
├── index.ts                  # Main package entry point
├── package.json
├── tsconfig.json
├── eslint.config.js
├── README.md
└── CHANGELOG.md
```

---

## Architecture & Design Patterns

### 1. Manager Pattern (AIManager)

The `AIManager` class orchestrates multiple AI drivers, similar to how AdonisJS's MailManager handles multiple mail transports.

**Location:** `src/ai_manager.ts`

**Key Methods:**
- `use(driver?: string): AIDriver` - Get a specific driver or default
- `registerDriver(name: string, driver: AIDriver)` - Register a new driver
- `hasDriver(driver: string): boolean` - Check if driver exists
- `getDefaultDriver(): string` - Get default driver name

### 2. Driver Pattern

Each AI provider implements the `AIDriverContract` interface:

**Interface (src/types.ts:52-77):**
```typescript
interface AIDriverContract {
  generate(prompt: string, options?: any): Promise<AIResponse>
  chat(messages: AIChatMessage[], options?: any): Promise<AIChatResponse>
  embed(text: string | string[], options?: any): Promise<AIEmbeddingResponse>
  stream(prompt: string, options?: any): Promise<AIStreamResponse>
  close?(): void | Promise<void>
}
```

**Base Driver:** `drivers/base_driver.ts`
- Provides common error handling via `mapCommonErrors()`
- Implements retry logic with exponential backoff via `withRetry()`
- Implements timeout handling via `withTimeout()`
- Token estimation utility via `estimateTokens()`

**Implementations:**
- `drivers/openai/main.ts` - OpenAI provider
- `drivers/gemini/main.ts` - Google Gemini provider

### 3. Provider Pattern

**File:** `providers/ai_provider.ts`

Follows AdonisJS provider lifecycle:
1. `register()` - Binds AI manager to container as singleton
2. `boot()` - Called when app is booting
3. `shutdown()` - Cleanup hook

The provider registers all configured drivers with the AIManager during the register phase.

### 4. Service Singleton Pattern

**File:** `services/main.ts`

Exports a singleton instance of AIManager from the container, allowing consumers to import:
```typescript
import ai from '@awalsolution/adonis-ai/services/main'
```

### 5. Configuration Pattern

**File:** `src/define_config.ts`

Uses AdonisJS's configuration provider pattern with:
- `defineConfig()` - Type-safe config definition
- `services` object - Helper functions for each provider
- Environment variable validation

---

## Development Workflow

### Prerequisites

- Node.js >= 20.6.0
- npm or equivalent package manager

### Setup

```bash
# Install dependencies
npm install

# Run type checking
npm run typecheck

# Run linting
npm run lint

# Format code
npm run format

# Run tests
npm test

# Quick test (without coverage)
npm run quick:test
```

### Build Process

```bash
# Clean build directory
npm run clean

# Build TypeScript -> JavaScript
npm run build

# The build process:
# 1. Runs lint
# 2. Cleans build directory
# 3. Compiles TypeScript
# 4. Copies stub templates to build/
```

### Testing

- **Framework:** Japa Runner v3
- **Assertions:** @japa/assert
- **Coverage:** c8 (v8 coverage)
- **Location:** `tests/` directory
- **Command:** `npm test` (includes lint + coverage)

Tests run on:
- Ubuntu Latest
- Windows Latest
- Node 20.10.0 and 21.x

### Release Process

The package uses `np` for releases:

```bash
npm run release
```

**Release Configuration (package.json:92-97):**
- Commit message format: `chore(release): %s`
- Target tag: `latest`
- Branch: `main` only
- Runs build before publishing

**Version Hooks:**
- `version` script runs build
- `prepublishOnly` ensures build before publish

---

## Code Conventions & Style

### TypeScript

- **Config:** Extends `@adonisjs/tsconfig/tsconfig.package.json`
- **Module:** ESM only (type: "module")
- **Root Dir:** `./`
- **Out Dir:** `./build`
- **Strict mode:** Enabled via AdonisJS config

### ESLint

- **Config:** `@adonisjs/eslint-config` v2.0.0-beta.7
- **File:** `eslint.config.js`
- Uses AdonisJS package preset

### Prettier

- **Config:** `@adonisjs/prettier-config`
- **Ignore:** `.prettierignore` excludes build artifacts

### Naming Conventions

1. **Files:**
   - Snake case for source files: `ai_manager.ts`, `define_config.ts`
   - PascalCase for classes: `AIManager`, `BaseAIDriver`

2. **Interfaces:**
   - PascalCase with descriptive names: `AIDriverContract`, `AIResponse`
   - Contract suffix for interfaces that define behavior: `AIDriverContract`

3. **Errors:**
   - PascalCase with Exception suffix: `AIApiKeyException`, `AITimeoutException`
   - All extend AdonisJS `Exception` class

4. **Environment Variables:**
   - SCREAMING_SNAKE_CASE: `AI_DRIVER`, `OPENAI_API_KEY`
   - Provider-prefixed: `OPENAI_*`, `GEMINI_*`

### Code Structure

1. **File Headers:**
   All source files include a header comment block:
   ```typescript
   /*
   |--------------------------------------------------------------------------
   | [File Purpose]
   |--------------------------------------------------------------------------
   |
   | [Description]
   |
   */
   ```

2. **Imports:**
   - External packages first
   - Internal modules second
   - Type imports separate when beneficial
   - Use `.js` extensions in imports (ESM requirement)

3. **Export Pattern:**
   - Named exports for utilities and classes
   - Default export for main/singleton services
   - Barrel exports in `index.ts`

---

## Key Files & Their Purpose

### Core Files

| File | Purpose | Key Exports |
|------|---------|-------------|
| `index.ts` | Main package entry point | All public APIs, types, and utilities |
| `src/types.ts` | TypeScript definitions | All interfaces and types |
| `src/ai_manager.ts` | Central manager | `AIManager` class |
| `src/errors.ts` | Custom exceptions | All error classes |
| `src/define_config.ts` | Config helpers | `defineConfig()`, `services` |
| `src/ai_response.ts` | Response types | Response class implementations |
| `src/debug.ts` | Debug logging | Debug logger instance |

### Driver Files

| File | Purpose |
|------|---------|
| `drivers/base_driver.ts` | Abstract base class with common functionality |
| `drivers/openai/main.ts` | OpenAI API integration |
| `drivers/openai/types.ts` | OpenAI-specific types |
| `drivers/gemini/main.ts` | Google Gemini API integration |
| `drivers/gemini/types.ts` | Gemini-specific types |

### Provider Files

| File | Purpose |
|------|---------|
| `providers/ai_provider.ts` | AdonisJS service provider registration |
| `services/main.ts` | Singleton service export |

### Configuration

| File | Purpose |
|------|---------|
| `configure.ts` | Interactive CLI configuration wizard |
| `stubs/config/ai.stub` | Template for user config file |

### Supporting Files

| File | Purpose |
|------|---------|
| `package.json` | Package metadata, scripts, dependencies |
| `tsconfig.json` | TypeScript compiler configuration |
| `eslint.config.js` | ESLint rules configuration |
| `.editorconfig` | Editor formatting rules |
| `.prettierignore` | Files to exclude from formatting |

---

## Error Handling

### Exception Hierarchy

All exceptions extend AdonisJS's `Exception` class and include:
- `code` - Error code (e.g., `E_AI_API_KEY_ERROR`)
- `status` - HTTP status code
- `handle()` - HTTP response handler
- `report()` - Logger integration
- `debug` - Flag for showing detailed errors (false in production)

### Custom Exceptions

**Location:** `src/errors.ts`

| Exception | Code | Status | Use Case |
|-----------|------|--------|----------|
| `AIDriverNotFoundException` | `E_AI_DRIVER_NOT_FOUND` | 500 | Requested driver not configured |
| `AIConfigurationException` | `E_AI_CONFIGURATION_ERROR` | 500 | Invalid configuration |
| `AIApiKeyException` | `E_AI_API_KEY_ERROR` | 500 | Missing/invalid API key |
| `AIServiceException` | `E_AI_SERVICE_ERROR` | 500 | General AI service errors |
| `AITimeoutException` | `E_AI_TIMEOUT` | 408 | Request timeout |
| `AIRateLimitException` | `E_AI_RATE_LIMIT` | 429 | Rate limit exceeded |

### Error Handling Pattern

```typescript
try {
  const result = await ai.use().generate(prompt)
  return result
} catch (error) {
  if (error instanceof AIApiKeyException) {
    // Handle API key errors
  } else if (error instanceof AIRateLimitException) {
    // Handle rate limiting
  } else if (error instanceof AITimeoutException) {
    // Handle timeouts
  }
  throw error
}
```

### Retry Logic

**Location:** `drivers/base_driver.ts:143-179`

- Exponential backoff with jitter
- Configurable max retries (default: 3)
- Skips retry for auth errors (401, 403) and validation errors (400)
- Formula: `delay = min(1000 * 2^attempt, 10000) + random(0-1000)`

---

## Configuration System

### Environment Variables

**Core Settings:**
- `AI_DRIVER` - Default AI provider (enum of configured services)
- `AI_TIMEOUT` - Request timeout in milliseconds (default: 30000)
- `AI_MAX_RETRIES` - Max retry attempts (default: 3)

**OpenAI Settings:**
- `OPENAI_API_KEY` - OpenAI API key (required)
- `OPENAI_MODEL` - Model name (default: gpt-3.5-turbo)
- `OPENAI_EMBEDDING_MODEL` - Embedding model (default: text-embedding-ada-002)
- `OPENAI_MAX_TOKENS` - Max tokens (default: 1000)
- `OPENAI_TEMPERATURE` - Temperature (default: 0.7)

**Gemini Settings:**
- `GEMINI_API_KEY` - Google Gemini API key (required)
- `GEMINI_MODEL` - Model name (default: gemini-pro)
- `GEMINI_EMBEDDING_MODEL` - Embedding model (default: embedding-001)
- `GEMINI_MAX_TOKENS` - Max tokens (default: 1000)
- `GEMINI_TEMPERATURE` - Temperature (default: 0.7)

### Configuration File

**Location:** `config/ai.ts` (created during setup)

```typescript
import env from '#start/env'
import { defineConfig, services } from '@awalsolution/adonis-ai'

export default defineConfig({
  default: env.get('AI_DRIVER'),
  timeout: env.get('AI_TIMEOUT', 30000),
  maxRetries: env.get('AI_MAX_RETRIES', 3),

  services: {
    openai: services.openai({
      apiKey: env.get('OPENAI_API_KEY'),
      model: env.get('OPENAI_MODEL'),
      embeddingModel: env.get('OPENAI_EMBEDDING_MODEL'),
    }),
    gemini: services.gemini({
      apiKey: env.get('GEMINI_API_KEY'),
      model: env.get('GEMINI_MODEL'),
      embeddingModel: env.get('GEMINI_EMBEDDING_MODEL'),
    }),
  },
})
```

---

## Common Tasks for AI Assistants

### Adding a New AI Driver

1. **Create driver directory:** `drivers/your-provider/`
2. **Implement driver class:**
   ```typescript
   import { BaseAIDriver } from '../base_driver.js'

   export class YourProviderDriver extends BaseAIDriver {
     // Implement required methods
   }
   ```
3. **Add types:** Create `drivers/your-provider/types.ts`
4. **Add to configuration:**
   - Update `configure.ts` with provider details
   - Add to `AI_SERVICES` object
   - Add environment variables
5. **Update exports:** Add to `src/define_config.ts` services helper
6. **Add tests:** Create test file in `tests/`
7. **Update documentation:** README.md and this file

### Adding a New Method to Drivers

1. **Update interface:** Add method to `AIDriverContract` in `src/types.ts`
2. **Add to base driver:** Implement common logic in `drivers/base_driver.ts` if applicable
3. **Implement in each driver:** Update OpenAI and Gemini drivers
4. **Add response type:** Create new response interface in `src/types.ts` if needed
5. **Add tests:** Test new functionality
6. **Update docs:** README.md examples

### Fixing a Bug

1. **Add failing test:** Write test that reproduces the bug
2. **Fix the issue:** Make minimal changes to fix the bug
3. **Verify tests pass:** `npm test`
4. **Check types:** `npm run typecheck`
5. **Lint:** `npm run lint`
6. **Update CHANGELOG.md:** Add entry under "Unreleased" if applicable

### Adding a New Feature

1. **Discuss design:** Consider impact on existing APIs
2. **Update types:** Add necessary TypeScript types
3. **Implement feature:** Follow existing patterns
4. **Add tests:** Comprehensive test coverage
5. **Update documentation:** README.md with examples
6. **Update CHANGELOG.md:** Add entry

### Debugging Issues

**Enable debug logging:**
```bash
NODE_DEBUG=adonis:ai node ace serve
```

**Debug logger location:** `src/debug.ts`

The package uses Node's built-in debug module with namespace `adonis:ai`.

---

## Dependencies

### Runtime Dependencies

- `openai` (^4.57.0) - OpenAI API client
- `@google/generative-ai` (^0.17.1) - Google Gemini API client

### Peer Dependencies

- `@adonisjs/core` (^6.2.0) - AdonisJS framework

### Dev Dependencies

Key dev dependencies:
- `typescript` (^5.4.5)
- `@adonisjs/eslint-config` (2.0.0-beta.7)
- `@adonisjs/prettier-config` (^1.4.0)
- `@japa/runner` (^3.1.4) - Testing framework
- `@japa/assert` (^3.0.0) - Assertions
- `c8` (^10.1.2) - Code coverage
- `np` (^10.0.6) - Release management

---

## Package Exports

The package uses Node.js subpath exports:

```json
{
  ".": "./build/index.js",
  "./types": "./build/src/types.js",
  "./ai_provider": "./build/providers/ai_provider.js",
  "./services/main": "./build/services/main.js",
  "./drivers/gemini": "./build/drivers/gemini/main.js",
  "./drivers/gemini/types": "./build/drivers/gemini/types.js",
  "./drivers/openai": "./build/drivers/openai/main.js",
  "./drivers/openai/types": "./build/drivers/openai/types.js"
}
```

---

## Important Notes for AI Assistants

### 1. ESM Module System

- All imports MUST use `.js` extension (even for `.ts` files)
- Use `import` syntax, not `require()`
- Top-level await is supported

### 2. AdonisJS Conventions

- Follow AdonisJS's provider lifecycle pattern
- Use AdonisJS's Exception class for errors
- Configuration uses `defineConfig` pattern
- Service providers use dependency injection container

### 3. Type Safety

- Everything is strongly typed
- Use TypeScript's utility types when appropriate
- Export types separately when needed
- Interface segregation for contracts

### 4. Error Handling

- Always extend from AdonisJS's `Exception` class
- Include `code`, `status`, `handle()`, and `report()` methods
- Map provider-specific errors to package exceptions in base driver
- Don't retry on authentication or validation errors

### 5. Testing

- Write tests for all new features
- Use Japa's assertion library
- Mock external API calls
- Test both success and error cases

### 6. Documentation

- Keep README.md updated with examples
- Document all public APIs with JSDoc comments
- Update CHANGELOG.md for notable changes
- Use code examples that actually work

### 7. Backward Compatibility

- Don't break existing APIs without major version bump
- Follow semantic versioning strictly
- Mark deprecated features with JSDoc `@deprecated` tag

### 8. Performance

- Use retry logic wisely (exponential backoff with jitter)
- Implement timeout on all external requests
- Consider token limits and costs
- Cache when appropriate (document in code)

### 9. Security

- Never log API keys or sensitive data
- Validate all user inputs
- Use environment variables for secrets
- Follow principle of least privilege

### 10. Code Quality

- Run `npm run lint` before committing
- Run `npm run typecheck` before committing
- Run `npm test` before pushing
- Follow existing code style and patterns

---

## Useful Commands Reference

```bash
# Development
npm install                    # Install dependencies
npm run typecheck             # Check TypeScript types
npm run lint                  # Lint code
npm run format                # Format code with Prettier

# Testing
npm test                      # Run tests with coverage
npm run quick:test            # Run tests without coverage

# Building
npm run clean                 # Clean build directory
npm run build                 # Build the package
npm run prebuild             # Run lint and clean

# Release
npm run release               # Interactive release with np
npm run version              # Run during npm version (runs build)

# Testing in Consumer Project
npm link                      # Link package locally
cd /path/to/consumer && npm link @awalsolution/adonis-ai
```

---

## Git Workflow

### Branch Strategy

- `main` - Production-ready code
- Feature branches: `feature/description`
- Bug fixes: `fix/description`
- Releases: Created via `np` tool

### Commit Message Format

- Follow conventional commits when possible
- Release commits: `chore(release): X.Y.Z` (automated by np)
- Feature commits: `feat: description`
- Bug fixes: `fix: description`
- Docs: `docs: description`
- Chores: `chore: description`

### CI/CD

**File:** `.github/workflows/test.yml`

**Jobs:**
1. **lint** - Runs ESLint
2. **typecheck** - Runs TypeScript compiler checks
3. **tests** - Runs test suite on Ubuntu and Windows with Node 20.x and 21.x
4. **windows** - Additional Windows-specific tests

**Triggers:** Push and Pull Request on all branches

---

## Debugging Tips

### Common Issues

1. **"AI driver not found"**
   - Check `config/ai.ts` has the driver configured
   - Verify `AI_DRIVER` env var matches a configured service
   - Ensure provider was registered in `ai_provider.ts`

2. **"API key is missing or invalid"**
   - Check `.env` file has correct API key
   - Verify env validation in `start/env.ts`
   - Check no extra whitespace in API key

3. **Import errors with `.js` extensions**
   - This is required for ESM modules
   - TypeScript will compile `.ts` to `.js`
   - Always use `.js` in imports even for `.ts` files

4. **Type errors after changes**
   - Run `npm run typecheck`
   - Check `src/types.ts` for interface definitions
   - Ensure all implementations match contracts

5. **Tests failing**
   - Check test file imports use correct paths
   - Verify mocks are properly set up
   - Run `npm run quick:test` for faster iteration

---

## Resources

- **Package Repository:** https://github.com/awalsolution/adonis-ai
- **NPM Package:** https://www.npmjs.com/package/@awalsolution/adonis-ai
- **AdonisJS Docs:** https://docs.adonisjs.com
- **OpenAI API Docs:** https://platform.openai.com/docs
- **Google Gemini Docs:** https://ai.google.dev/docs
- **Japa Testing Docs:** https://japa.dev

---

## Version History

- **1.0.3** (Current) - Latest stable release
- **1.0.2** - Bug fixes
- **1.0.1** - Initial bug fixes
- **1.0.0** - First stable release
- **0.0.1** - Initial release

See CHANGELOG.md for detailed version history.

---

## Contact & Support

- **Email:** support@awalsolution.com
- **Issues:** https://github.com/awalsolution/adonis-ai/issues
- **Discussions:** https://github.com/awalsolution/adonis-ai/discussions

---

*This document was last updated for version 1.0.3 of @awalsolution/adonis-ai*

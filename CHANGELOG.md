# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [0.0.1] - 2025-01-25

### Added

- Initial release of @awalsolution/adonis-ai package
- Support for OpenAI and Google Gemini AI providers
- Unified AIManager interface for provider-agnostic access
- Interactive CLI configuration command
- Comprehensive test suite with Japa framework
- TypeScript types and environment variable validation
- Configurable timeouts, retries, and model settings
- Text generation, chat completion, embeddings, and streaming support
- Provider lifecycle management following AdonisJS conventions
- Extensible architecture for future AI providers

### Features

- **Multiple AI Providers**: OpenAI (GPT-3.5, GPT-4) and Google Gemini (Pro, Pro Vision)
- **Unified Interface**: Single API for all AI operations regardless of provider
- **Configuration Management**: Interactive setup with environment variable generation
- **Error Handling**: Comprehensive error types and retry mechanisms
- **Testing**: Full test coverage with mocks and factories
- **Documentation**: Complete README with usage examples and API reference

### Architecture

- **AIManager**: Central orchestrator for AI services
- **Driver Pattern**: Individual drivers for each AI provider
- **Provider Lifecycle**: Register, boot, start, ready, shutdown hooks
- **Configuration System**: Type-safe configuration with validation
- **Environment Integration**: Full environment variable support

## [Unreleased]

### Planned Features

- Support for additional AI providers (Anthropic, Mistral, etc.)
- Caching layer for embeddings and responses
- Rate limiting and usage tracking
- Advanced streaming options
- Template helpers for Edge.js integration
- Performance monitoring and metrics

---

## Contributing

We welcome contributions! Please see our contributing guidelines for details.

## License

This project is licensed under the MIT License - see the [LICENSE.md](LICENSE.md) file for details.

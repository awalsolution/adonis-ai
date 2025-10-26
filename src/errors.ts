/*
|--------------------------------------------------------------------------
| AI Errors
|--------------------------------------------------------------------------
|
| This file contains all the error classes used by the AI package.
| It follows the same pattern as the Drive package errors.
|
*/

import { type HttpContext } from '@adonisjs/core/http'
import { Exception } from '@adonisjs/core/exceptions'

/**
 * The exception is raised when an AI driver is not found or not configured.
 *
 * @example
 * ```js
 * try {
 *   await ai.use('openai').generate('Hello')
 * } catch (error) {
 *   if (error instanceof AIDriverNotFoundException) {
 *     console.log('AI driver not found:', error.message)
 *   }
 * }
 * ```
 */
export class AIDriverNotFoundException extends Exception {
  /**
   * Flag to determine if debug information should be shown.
   * Set to false in production mode.
   */
  debug = process.env.NODE_ENV !== 'production'

  /**
   * Creates a new AIDriverNotFoundException instance.
   *
   * @param driver - The name of the driver that was not found
   */
  constructor(driver: string) {
    super(`AI driver "${driver}" is not registered or not configured`, {
      code: 'E_AI_DRIVER_NOT_FOUND',
      status: 500,
    })
  }

  /**
   * Converts error to an HTTP response.
   *
   * @param error - The AIDriverNotFoundException instance to handle
   * @param ctx - The HTTP context for the request
   */
  handle(error: this, ctx: HttpContext) {
    /**
     * In non-debug mode (aka production) we explicitly
     * respond with a 500 response and a generic
     * message.
     */
    if (!this.debug) {
      return ctx.response.status(500).send('Internal server error')
    }

    return ctx.response.status(error.status).send(error.message)
  }

  /**
   * Reporting the error using the logger
   *
   * @param error - The AIDriverNotFoundException instance to report
   * @param ctx - The HTTP context for logging
   */
  report(error: this, ctx: HttpContext) {
    ctx.logger.error({ err: error.stack }, error.message)
  }
}

/**
 * The exception is raised when AI configuration is invalid.
 *
 * @example
 * ```js
 * try {
 *   await ai.use('openai').generate('Hello')
 * } catch (error) {
 *   if (error instanceof AIConfigurationException) {
 *     console.log('AI configuration error:', error.message)
 *   }
 * }
 * ```
 */
export class AIConfigurationException extends Exception {
  /**
   * Flag to determine if debug information should be shown.
   * Set to false in production mode.
   */
  debug = process.env.NODE_ENV !== 'production'

  /**
   * Creates a new AIConfigurationException instance.
   *
   * @param message - The configuration error message
   */
  constructor(message: string) {
    super(`Invalid AI configuration: ${message}`, {
      code: 'E_AI_CONFIGURATION_ERROR',
      status: 500,
    })
  }

  /**
   * Converts error to an HTTP response.
   *
   * @param error - The AIConfigurationException instance to handle
   * @param ctx - The HTTP context for the request
   */
  handle(error: this, ctx: HttpContext) {
    /**
     * In non-debug mode (aka production) we explicitly
     * respond with a 500 response and a generic
     * message.
     */
    if (!this.debug) {
      return ctx.response.status(500).send('Internal server error')
    }

    return ctx.response.status(error.status).send(error.message)
  }

  /**
   * Reporting the error using the logger
   *
   * @param error - The AIConfigurationException instance to report
   * @param ctx - The HTTP context for logging
   */
  report(error: this, ctx: HttpContext) {
    ctx.logger.error({ err: error.stack }, error.message)
  }
}

/**
 * The exception is raised when an API key is missing or invalid.
 *
 * @example
 * ```js
 * try {
 *   await ai.use('openai').generate('Hello')
 * } catch (error) {
 *   if (error instanceof AIApiKeyException) {
 *     console.log('API key error:', error.message)
 *   }
 * }
 * ```
 */
export class AIApiKeyException extends Exception {
  /**
   * Flag to determine if debug information should be shown.
   * Set to false in production mode.
   */
  debug = process.env.NODE_ENV !== 'production'

  /**
   * Creates a new AIApiKeyException instance.
   *
   * @param provider - The name of the AI provider
   */
  constructor(provider: string) {
    super(`Missing or invalid API key for ${provider} provider`, {
      code: 'E_AI_API_KEY_ERROR',
      status: 500,
    })
  }

  /**
   * Converts error to an HTTP response.
   *
   * @param error - The AIApiKeyException instance to handle
   * @param ctx - The HTTP context for the request
   */
  handle(error: this, ctx: HttpContext) {
    /**
     * In non-debug mode (aka production) we explicitly
     * respond with a 500 response and a generic
     * message.
     */
    if (!this.debug) {
      return ctx.response.status(500).send('Internal server error')
    }

    return ctx.response.status(error.status).send(error.message)
  }

  /**
   * Reporting the error using the logger
   *
   * @param error - The AIApiKeyException instance to report
   * @param ctx - The HTTP context for logging
   */
  report(error: this, ctx: HttpContext) {
    ctx.logger.error({ err: error.stack }, error.message)
  }
}

/**
 * The exception is raised when an AI service returns an error.
 *
 * @example
 * ```js
 * try {
 *   await ai.use('openai').generate('Hello')
 * } catch (error) {
 *   if (error instanceof AIServiceException) {
 *     console.log('AI service error:', error.message)
 *   }
 * }
 * ```
 */
export class AIServiceException extends Exception {
  /**
   * Flag to determine if debug information should be shown.
   * Set to false in production mode.
   */
  debug = process.env.NODE_ENV !== 'production'

  /**
   * Creates a new AIServiceException instance.
   *
   * @param provider - The name of the AI provider
   * @param message - The error message from the AI service
   * @param statusCode - The HTTP status code (optional)
   */
  constructor(provider: string, message: string, statusCode?: number) {
    super(`AI service error from ${provider}: ${message}`, {
      code: 'E_AI_SERVICE_ERROR',
      status: statusCode || 500,
    })
  }

  /**
   * Converts error to an HTTP response.
   *
   * @param error - The AIServiceException instance to handle
   * @param ctx - The HTTP context for the request
   */
  handle(error: this, ctx: HttpContext) {
    /**
     * In non-debug mode (aka production) we explicitly
     * respond with a 500 response and a generic
     * message.
     */
    if (!this.debug) {
      return ctx.response.status(500).send('Internal server error')
    }

    return ctx.response.status(error.status).send(error.message)
  }

  /**
   * Reporting the error using the logger
   *
   * @param error - The AIServiceException instance to report
   * @param ctx - The HTTP context for logging
   */
  report(error: this, ctx: HttpContext) {
    ctx.logger.error({ err: error.stack }, error.message)
  }
}

/**
 * The exception is raised when an AI request times out.
 *
 * @example
 * ```js
 * try {
 *   await ai.use('openai').generate('Hello')
 * } catch (error) {
 *   if (error instanceof AITimeoutException) {
 *     console.log('AI timeout:', error.message)
 *   }
 * }
 * ```
 */
export class AITimeoutException extends Exception {
  /**
   * Flag to determine if debug information should be shown.
   * Set to false in production mode.
   */
  debug = process.env.NODE_ENV !== 'production'

  /**
   * Creates a new AITimeoutException instance.
   *
   * @param provider - The name of the AI provider
   * @param timeout - The timeout duration in milliseconds
   */
  constructor(provider: string, timeout: number) {
    super(`AI request to ${provider} timed out after ${timeout}ms`, {
      code: 'E_AI_TIMEOUT',
      status: 408,
    })
  }

  /**
   * Converts error to an HTTP response.
   *
   * @param error - The AITimeoutException instance to handle
   * @param ctx - The HTTP context for the request
   */
  handle(error: this, ctx: HttpContext) {
    /**
     * In non-debug mode (aka production) we explicitly
     * respond with a 408 response and a generic
     * message.
     */
    if (!this.debug) {
      return ctx.response.status(408).send('Request timeout')
    }

    return ctx.response.status(error.status).send(error.message)
  }

  /**
   * Reporting the error using the logger
   *
   * @param error - The AITimeoutException instance to report
   * @param ctx - The HTTP context for logging
   */
  report(error: this, ctx: HttpContext) {
    ctx.logger.warn(error.message)
  }
}

/**
 * The exception is raised when an AI request exceeds rate limits.
 *
 * @example
 * ```js
 * try {
 *   await ai.use('openai').generate('Hello')
 * } catch (error) {
 *   if (error instanceof AIRateLimitException) {
 *     console.log('AI rate limit:', error.message)
 *   }
 * }
 * ```
 */
export class AIRateLimitException extends Exception {
  /**
   * Flag to determine if debug information should be shown.
   * Set to false in production mode.
   */
  debug = process.env.NODE_ENV !== 'production'

  /**
   * Creates a new AIRateLimitException instance.
   *
   * @param provider - The name of the AI provider
   * @param retryAfter - The retry after duration in seconds (optional)
   */
  constructor(provider: string, retryAfter?: number) {
    super(
      `AI request to ${provider} exceeded rate limits${retryAfter ? `, retry after ${retryAfter}s` : ''}`,
      {
        code: 'E_AI_RATE_LIMIT',
        status: 429,
      }
    )
  }

  /**
   * Converts error to an HTTP response.
   *
   * @param error - The AIRateLimitException instance to handle
   * @param ctx - The HTTP context for the request
   */
  handle(error: this, ctx: HttpContext) {
    /**
     * In non-debug mode (aka production) we explicitly
     * respond with a 429 response and a generic
     * message.
     */
    if (!this.debug) {
      return ctx.response.status(429).send('Too many requests')
    }

    return ctx.response.status(error.status).send(error.message)
  }

  /**
   * Reporting the error using the logger
   *
   * @param error - The AIRateLimitException instance to report
   * @param ctx - The HTTP context for logging
   */
  report(error: this, ctx: HttpContext) {
    ctx.logger.warn(error.message)
  }
}

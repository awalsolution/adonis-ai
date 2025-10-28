/*
|--------------------------------------------------------------------------
| Configure hook
|--------------------------------------------------------------------------
|
| The configure hook is called when someone runs "node ace configure <package>"
| command. You are free to perform any operations inside this function to
| configure the package.
|
| To make things easier, you have access to the underlying "ConfigureCommand"
| instance and you can use codemods to modify the source files.
|
*/

import string from '@poppinss/utils/string'
import type Configure from '@adonisjs/core/commands/configure'
import { stubsRoot } from './stubs/main.js'

/**
 * List of available AI services
 */
const AI_SERVICES = {
  openai: {
    name: 'OpenAI',
    env: [
      { name: 'OPENAI_API_KEY', value: '', schema: 'Env.schema.string()' },
      {
        name: 'OPENAI_MODEL',
        value: 'gpt-3.5-turbo',
        schema: `Env.schema.enum(['gpt-3.5-turbo','gpt-4','gpt-4-turbo-preview'] as const)`,
      },
      { name: 'OPENAI_MAX_TOKENS', value: '1000', schema: 'Env.schema.number()' },
      { name: 'OPENAI_TEMPERATURE', value: '0.7', schema: 'Env.schema.number()' },
    ],
    dependencies: ['openai'],
  },
  gemini: {
    name: 'Gemini',
    env: [
      { name: 'GEMINI_API_KEY', value: '', schema: 'Env.schema.string()' },
      {
        name: 'GEMINI_MODEL',
        value: 'gemini-pro',
        schema: `Env.schema.enum(['gemini-pro','gemini-pro-vision'] as const)`,
      },
      { name: 'GEMINI_MAX_TOKENS', value: '1000', schema: 'Env.schema.number()' },
      { name: 'GEMINI_TEMPERATURE', value: '0.7', schema: 'Env.schema.number()' },
    ],
    dependencies: ['@google/generative-ai'],
  },
}

/**
 * List of known services
 */
const SERVICES_NAMES = Object.keys(AI_SERVICES) as (keyof typeof AI_SERVICES)[]

export async function configure(command: Configure) {
  /**
   * Read services from the "--services" CLI flag
   */
  let selectedServices: keyof typeof AI_SERVICES | (keyof typeof AI_SERVICES)[] | undefined =
    command.parsedFlags.services

  /**
   * Should dependencies be installed
   */
  let shouldInstallPackages: boolean | undefined = command.parsedFlags.install

  /**
   * Display prompt when no services are specified
   * via the CLI flag.
   */
  if (!selectedServices) {
    selectedServices = await command.prompt.multiple(
      'Select the AI services you want to use',
      SERVICES_NAMES.map((service) => {
        return {
          name: service,
          message: AI_SERVICES[service].name,
        }
      }),
      {
        validate(values) {
          return !values || !values.length ? 'Please select one or more services' : true
        },
      }
    )
  }

  /**
   * Normalized list of services
   */
  const services = typeof selectedServices === 'string' ? [selectedServices] : selectedServices!

  const unknownServices = services.find((service) => !SERVICES_NAMES.includes(service))
  if (unknownServices) {
    command.exitCode = 1
    command.logger.logError(
      `Invalid service "${unknownServices}". Supported services are: ${string.sentence(
        SERVICES_NAMES
      )}`
    )
    return
  }

  /**
   * Create a flat collection of dependencies to install
   * based upon the configured services.
   */
  const pkgsToInstall = services
    .flatMap((service) => AI_SERVICES[service].dependencies)
    .map((pkg) => {
      return { name: pkg, isDevDependency: false }
    })

  /**
   * Prompt to install additional services
   */
  if (!shouldInstallPackages && pkgsToInstall.length) {
    shouldInstallPackages = await command.prompt.confirm(
      'Do you want to install additional packages required by "@awalsolution/adonis-ai"?'
    )
  }

  const codemods = await command.createCodemods()

  /**
   * Publish config file
   */
  await codemods.makeUsingStub(stubsRoot, 'config/ai.stub', {
    services,
  })

  /**
   * Publish provider
   */
  await codemods.updateRcFile((rcFile) => {
    rcFile.addProvider('@awalsolution/adonis-ai/ai_provider')
  })

  /**
   * Define env variables for the selected services
   */
  await codemods.defineEnvVariables(
    services.reduce<Record<string, string>>(
      (result, service) => {
        AI_SERVICES[service].env.forEach((envVariable) => {
          result[envVariable.name] = envVariable.value
        })
        return result
      },
      {
        AI_DRIVER: services[0],
        AI_TIMEOUT: '30000',
        AI_MAX_RETRIES: '3',
      }
    )
  )

  /**
   * Define env variables validation for the selected services
   */
  await codemods.defineEnvValidations({
    leadingComment: 'Variables for configuring the AI package',
    variables: services.reduce<Record<string, string>>(
      (result, service) => {
        AI_SERVICES[service].env.forEach((envVariable) => {
          result[envVariable.name] = envVariable.schema
        })
        return result
      },
      {
        AI_DRIVER: `Env.schema.enum(['${services.join("','")}'] as const)`,
        AI_TIMEOUT: 'Env.schema.number()',
        AI_MAX_RETRIES: 'Env.schema.number()',
      }
    ),
  })

  if (shouldInstallPackages) {
    await codemods.installPackages(pkgsToInstall)
  } else {
    await codemods.listPackagesToInstall(pkgsToInstall)
  }

  command.logger.info('AI package configured successfully!')
}

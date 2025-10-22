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

import type ConfigureCommand from '@adonisjs/core/commands/configure'
import { stubsRoot } from './stubs/main.js'

export async function configure(command: ConfigureCommand) {
  const codemods = await command.createCodemods()

  // Prompt user to select AI providers
  const selectedProviders = await command.prompt.multiple('Select AI providers to configure', [
    { name: 'openai', message: 'OpenAI (GPT models)' },
    { name: 'gemini', message: 'Google Gemini' },
  ])

  if (selectedProviders.length === 0) {
    command.logger.error('Please select at least one AI provider')
    return
  }

  // Install required dependencies
  const dependencies: { name: string; isDevDependency: boolean }[] = []
  if (selectedProviders.includes('openai')) {
    dependencies.push({ name: 'openai', isDevDependency: false })
  }
  if (selectedProviders.includes('gemini')) {
    dependencies.push({ name: '@google/generative-ai', isDevDependency: false })
  }

  if (dependencies.length > 0) {
    await codemods.installPackages(dependencies)
  }

  // Create config file
  await codemods.makeUsingStub(stubsRoot, 'config/ai.stub', {
    defaultProvider: selectedProviders[0],
    providers: selectedProviders,
  })

  // Update .adonisrc.ts to register the provider
  await codemods.updateRcFile((rcFile) => {
    rcFile.addProvider('@awalsolution/adonis-ai/ai_provider')
  })

  // Create environment variables template
  const envVariables: string[] = []
  if (selectedProviders.includes('openai')) {
    envVariables.push('OPENAI_API_KEY=')
    envVariables.push('OPENAI_ORGANIZATION=')
  }
  if (selectedProviders.includes('gemini')) {
    envVariables.push('GEMINI_API_KEY=')
  }

  if (envVariables.length > 0) {
    // Note: updateEnvFile might not be available in all AdonisJS versions
    // This is a placeholder for environment variable updates
    command.logger.info('Please add the following environment variables to your .env file:')
    envVariables.forEach((variable) => {
      command.logger.info(`  ${variable}`)
    })
  }

  command.logger.success('AI package configured successfully!')
  command.logger.info('Please add your API keys to the .env file')
  command.logger.info('You can now use the AI service in your application:')
  command.logger.info('  const ai = await app.container.make("ai")')
  command.logger.info('  const response = await ai.generateText("Hello, world!")')
}

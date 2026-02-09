import * as prettier from 'prettier'

export async function format(code: string) {
  const configPath = await prettier.resolveConfigFile()

  if (!configPath) {
    return code
  }

  const options = await prettier.resolveConfig(configPath)

  if (!options) {
    return code
  }

  return prettier.format(code, {
    ...options,
    parser: 'typescript',
  })
}

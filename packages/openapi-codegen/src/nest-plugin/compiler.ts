export function createValidationFactory(name: string, type: string, schema: string) {
  return `
    export function ${name}(data: ${type}) {
      return v.parse(${schema}, data)
    }
  `
}

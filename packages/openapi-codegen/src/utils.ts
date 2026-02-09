export function toPascalCase(value: string) {
  return value
    .replace(/([a-z])([A-Z])/g, '$1 $2')
    .replace(/[-_]+|[^\p{L}\p{N}]/gu, ' ')
    .toLowerCase()
    .replace(/(?:^|\s)(\p{L})/gu, (_, letter) => letter.toUpperCase())
    .replace(/\s+/g, '')
}

export function getComponentNameFromRef(ref: string) {
  const matches = ref.match(/^#\/components\/schemas\/(.+)$/)

  return matches ? decodeURIComponent(matches.at(1) ?? '') : null
}

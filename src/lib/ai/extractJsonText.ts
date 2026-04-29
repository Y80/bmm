import { findJsonObjectTexts, stripJsonCodeFence } from './json'

export function extractAiJsonText(text: string) {
  const jsonText = findJsonObjectTexts(text).at(-1)
  return jsonText?.trim() || stripJsonCodeFence(text)
}

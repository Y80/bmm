#!/usr/bin/env zx

import 'zx/globals'
import { loadEnv } from './utils'

async function main() {
  await loadEnv()
  const targetPath = path.resolve('.', 'local.d.ts')
  const fileContent = `
declare global {
  export type DB_DRIVER ='${process.env.DB_DRIVER}'
}
export {}
`.trim()

  try {
    // 仅当内容变化时才写入（网页6）
    const existingContent = await fs.readFile(targetPath, 'utf8').catch(() => '')
    if (existingContent.trim() === fileContent) return

    // 原子写入操作（网页5）
    await fs.writeFile(targetPath, fileContent, { encoding: 'utf-8' })
    console.log(`Type declaration updated at ${targetPath}`)
  } catch (error) {
    console.error('Failed to generate type declaration:', error)
    process.exit(1)
  }
}

main()

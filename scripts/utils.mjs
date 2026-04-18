import dotenv from 'dotenv'
import fs from 'fs'
import asyncFs from 'fs/promises'
import path from 'path'
import * as zx from 'zx'

export async function dbExecute(sql = '') {
  const { db } = await import('@/db')
  function execute() {
    if (typeof db.execute === 'function') {
      return db.execute.bind(db)
    }
    if (typeof db.$client.execute === 'function') {
      return db.$client.execute.bind(db.$client)
    }
    exitWithDbClose(1)
    throw new Error('无法获取数据库 execute() 方法')
  }
  return execute()(sql)
}

export async function testDbConnect() {
  try {
    await dbExecute('SELECT 1;')
    return true
  } catch (err) {
    console.error(err)
    return false
  }
}

export function redactDbConnectionUrl(connectionUrl = '') {
  if (!connectionUrl || connectionUrl.startsWith('file:') || connectionUrl === ':memory:') {
    return connectionUrl
  }

  try {
    const url = new URL(connectionUrl)
    const sensitiveKeys = new Set([
      'access_token',
      'api_key',
      'apikey',
      'auth_token',
      'authtoken',
      'key',
      'password',
      'passwd',
      'pwd',
      'secret',
      'token',
    ])

    if (url.username) {
      url.username = '***'
    }
    if (url.password) {
      url.password = '***'
    }

    for (const key of [...url.searchParams.keys()]) {
      if (sensitiveKeys.has(key.toLowerCase())) {
        url.searchParams.set(key, '***')
      }
    }

    return url.toString()
  } catch {
    return connectionUrl.replace(/\/\/([^/@:]+)(?::[^/@]*)?@/, '//***:***@')
  }
}

// 加载环境变量
export async function loadEnv(options = {}) {
  // 命令行传入 -P 或 --production 将使用正式环境变量
  const args = zx.minimist(process.argv.slice(2), { alias: { production: 'P' } })
  const isProduction = args.production === true
  if (!process.env.NODE_ENV) {
    // 不考虑 test 的情况
    process.env.NODE_ENV = isProduction ? 'production' : 'development'
  }
  const NextEnv = await import('@next/env')
  const loadEnvConfig = NextEnv.loadEnvConfig || NextEnv.default.loadEnvConfig
  loadEnvConfig(process.cwd(), isProduction)
  tryLoadParentGitRepoEnv(options)
}


// 当前应用如果作为 git submodule 存在，加载父级目录是的环境配置文件
export function tryLoadParentGitRepoEnv(options = {}) {
  if (!fs.existsSync(path.resolve('..', '.gitmodules'))) return
  const envPaths = [path.resolve('..', '.env'), path.resolve('..', '.env.' + process.env.NODE_ENV)]
  for (const envPath of envPaths) {
    if (!fs.existsSync(envPath)) continue
    dotenv.config({
      path: envPath,
      override: true,
    })
  }
  if (!options.silentParentEnvHint) {
    console.log(zx.chalk.cyan('💡 当前项目作为 git submodule，已加载主目录环境配置'))
  }
}


export function checkEnvs() {
  const requiredVariables = [
    'DB_DRIVER',
    'DB_CONNECTION_URL',
    'AUTH_SECRET',
  ]
  const unsetEnv = requiredVariables.filter((variable) => !process.env[variable])
  if (!process.env.AUTH_URL && process.env.VERCEL_URL) {
    process.env.AUTH_URL = process.env.VERCEL_URL
  }
  if (process.env.NODE_ENV === 'production' && !process.env.AUTH_URL) {
    unsetEnv.push('AUTH_URL')
  }
  if (unsetEnv.length) {
    zx.echo(zx.chalk.red('环境变量缺失: ' + unsetEnv.join(', ') + '\n'))
    process.exit(1)
  }
  if (process.env.DB_DRIVER !== 'postgresql' && process.env.DB_DRIVER !== 'sqlite') {
    zx.echo(zx.chalk.red('DB_DRIVER 只能为 postgresql 或 sqlite'))
    process.exit(1)
  }
}

export async function exitWithDbClose(code = 0) {
  const { db } = await import('@/db')
  if ('end' in db.$client) {
    await Promise.resolve(db.$client.end())
  } else if ('close' in db.$client) {
    await Promise.resolve(db.$client.close())
  }
  process.exit(code)
}


export async function declareLocalType() {
  if (!process.env.DB_DRIVER) throw new Error('环境变量 DB_DRIVER 未定义')
  const targetPath = path.resolve('local.d.ts')
  const fileContent = `
declare global {
  type DB_DRIVER ='${process.env.DB_DRIVER}'
}
export {}
`.trim()
  try {
    // 仅当内容变化时才写入
    const existingContent = await asyncFs.readFile(targetPath, 'utf8').catch(() => '')
    if (existingContent.trim() === fileContent) return
    await asyncFs.writeFile(targetPath, fileContent, { encoding: 'utf-8' })
    console.log(`Type declaration updated at ${targetPath}`)
  } catch (error) {
    console.error('Failed to generate type declaration:', error)
    process.exit(1)
  }
}

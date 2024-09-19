import dotenv from 'dotenv'
import fs from 'fs'
import path from 'path'
import * as zx from 'zx'

export async function testDbConnect() {
  const { pgSql } = await import('@/db/postgres/drivers/postgres')
  try {
    await pgSql`SELECT 1;`
    return true
  } catch {
    return false
  }
}

// 加载环境变量
export async function loadEnv() {
  // 命令行传入 -P 或 --production 将使用正式环境变量
  const args = minimist(process.argv.slice(2), { alias: { production: 'P' } })
  // console.log(args)
  const isProduction = args.production === true
  if (!process.env.NODE_ENV) {
    // 不考虑 test 的情况
    process.env.NODE_ENV = isProduction ? 'production' : 'development'
  }
  const { loadEnvConfig } = await import('@next/env')
  loadEnvConfig(process.cwd(), isProduction)

  tryLoadParentGitRepoEnv()
}


// 当前应用如果作为 git submodule 存在，加载父级目录是的环境配置文件
export function tryLoadParentGitRepoEnv() {
  if (!fs.existsSync(path.resolve('..', '.gitmodules'))) return
  console.log(zx.chalk.cyan('💡 已检测到当前项目作为 git submodule，正在加载主应用环境配置'))
  const envPaths = [path.resolve('..', '.env'), path.resolve('..', '.env.' + process.env.NODE_ENV)]
  for (const envPath of envPaths) {
    if (!fs.existsSync(envPath)) continue
    dotenv.config({
      path: envPath,
      override: true,
    })
    console.log('[Loaded] ' + envPath)
  }
  console.log()
}


export function checkEnvs() {
  const requiredVariables = [
    'DB_CONNECTION_URL',
    'AUTH_GITHUB_ID',
    'AUTH_GITHUB_SECRET',
    'AUTH_SECRET',
  ]
  const unsetEnv = requiredVariables.filter((variable) => !process.env[variable])
  if (unsetEnv.length) {
    zx.echo(zx.chalk.red('环境变量缺失: ' + unsetEnv.join(', ') + '\n'))
    process.exit(1)
  }
}

export async function exitWithDbEnd(code = 0) {
  const { pgSql } = await import('@/db')
  await pgSql.end()
  process.exit(code)
}

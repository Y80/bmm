#!/usr/bin/env zx

import 'zx/globals'
import { createInterface } from 'node:readline/promises'
import { checkEnvs, declareLocalType, exitWithDbClose, loadEnv, testDbConnect } from './utils.mjs'

function parseArgs() {
  const args = minimist(
    process.argv.slice(2).filter((arg) => arg !== '--'),
    {
    alias: {
      email: 'e',
      help: 'h',
    },
    boolean: ['help'],
    string: ['email'],
  }
  )

  if (args.help) {
    echo(chalk.yellow('用法：pnpm user:reset-password'))
    echo(chalk.yellow('或：pnpm user:reset-password -- --email user@example.com'))
    echo(chalk.yellow('运行后会交互输入新密码，密码不会出现在命令行历史中'))
    process.exit(0)
  }

  if (args.password || args.p || args._[1]) {
    echo(chalk.red('为了避免密码出现在命令行历史中，不再支持通过命令参数传入密码'))
    echo(chalk.yellow('请使用：pnpm user:reset-password -- --email user@example.com'))
    process.exit(1)
  }

  const email = args.email || args._[0]

  return { email }
}

function ensureInteractiveTerminal() {
  if (!process.stdin.isTTY || !process.stdout.isTTY) {
    throw new Error('当前命令需要交互式终端，请直接在终端中运行')
  }
}

async function promptText(message, defaultValue = '') {
  const rl = createInterface({
    input: process.stdin,
    output: process.stdout,
  })
  const suffix = defaultValue ? ` (${defaultValue})` : ''
  const answer = (await rl.question(`${message}${suffix}: `)).trim()
  rl.close()
  return answer || defaultValue
}

async function promptPassword(message) {
  return await new Promise((resolve, reject) => {
    const stdin = process.stdin
    const stdout = process.stdout
    const wasRaw = Boolean(stdin.isRaw)
    let password = ''
    let finished = false

    function cleanup({ newline = true } = {}) {
      if (finished) return
      finished = true
      stdin.removeListener('data', onData)
      if (stdin.isTTY) {
        stdin.setRawMode(wasRaw)
      }
      stdin.pause()
      newline && stdout.write('\n')
    }

    function onData(chunk) {
      for (const value of Array.from(chunk.toString('utf8'))) {
        if (value === '\u0003') {
          cleanup()
          reject(new Error('操作已取消'))
          return
        }

        if (value === '\r' || value === '\n') {
          cleanup()
          resolve(password)
          return
        }

        if (value === '\u007f') {
          if (password.length > 0) {
            password = password.slice(0, -1)
            stdout.write('\b \b')
          }
          continue
        }

        if (value >= ' ') {
          password += value
          stdout.write('*')
        }
      }
    }

    stdout.write(`${message}: `)
    stdin.resume()
    stdin.setRawMode(true)
    stdin.on('data', onData)
  })
}

async function promptNewPassword(passwordSchema) {
  while (true) {
    const password = await promptPassword('请输入新密码')

    const parsedPassword = passwordSchema.safeParse(password)
    if (!parsedPassword.success) {
      echo(chalk.red(parsedPassword.error.issues[0]?.message || '密码格式不正确，请重新输入'))
      continue
    }

    const confirmPassword = await promptPassword('请再次输入新密码')
    if (password !== confirmPassword) {
      echo(chalk.red('两次输入的密码不一致，请重新输入'))
      continue
    }

    return password
  }
}

async function main() {
  const { email: rawEmail } = parseArgs()
  await loadEnv()
  checkEnvs()
  await declareLocalType()
  ensureInteractiveTerminal()
  const email = await promptText('请输入目标账号邮箱', rawEmail || '')
  if (!email) {
    throw new Error('账号邮箱不能为空')
  }

  echo(chalk.cyan('当前环境：'), process.env.NODE_ENV)
  echo(chalk.cyan('数据库驱动：'), process.env.DB_DRIVER)
  echo(chalk.cyan('目标账号：'), email)

  if (!(await testDbConnect())) {
    echo(chalk.red('❌ 数据库连接失败，请检查'))
    process.exit(1)
  }

  const { zodSchemas } = await import('@/lib/zod')
  const password = await promptNewPassword(zodSchemas.userCredential.shape.password)
  const { default: CredentialsController } = await import('@/controllers/Credentials.controller')
  await CredentialsController.resetPassword({ email, password })

  echo(chalk.green('✅ 密码重设成功'))
  await exitWithDbClose()
}

main().catch(async (error) => {
  echo(chalk.red('❌ 密码重设失败'))
  console.error(error)
  await exitWithDbClose(1)
})

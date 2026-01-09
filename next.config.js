import { codeInspectorPlugin } from 'code-inspector-plugin';
import nextConst from 'next/constants.js';
import { checkEnvs, tryLoadParentGitRepoEnv } from './scripts/utils.mjs';

export default async function setup(phase) {
  tryLoadParentGitRepoEnv()

  if (phase === nextConst.PHASE_DEVELOPMENT_SERVER || phase === nextConst.PHASE_PRODUCTION_SERVER) {
    checkEnvs()
  }

  const domainHost = new URL(process.env.AUTH_URL || 'http://localhost').host

  /** @type {import('next').NextConfig} */
  const nextConfig = {
    output: 'standalone',
    images: {
      remotePatterns: [
        {
          protocol: 'https',
          hostname: '*.iconify.design',
          pathname: '**',
        },
      ],
      dangerouslyAllowSVG: true,
    },
    turbopack: {
      rules: codeInspectorPlugin({
        bundler: 'turbopack',
        hideDomPathAttr: true,
      })
    },
    webpack: (config, { webpack, nextRuntime }) => {
      // TODO 使用 turbopack 后是否需要？
      // https://github.com/vercel/next.js/discussions/39705
      // fix: edge 环境无法加载环境变量
      if (nextRuntime === 'edge') {
        config.plugins.push(new webpack.DefinePlugin({
          "process.env.AUTH_SECRET": JSON.stringify(process.env.AUTH_SECRET),
        }))
      }
      return config
    },
    experimental: {
      serverActions: { allowedOrigins: [domainHost] },
    },
    // 确保 standalone 输出包含 scripts 目录和 tsx 依赖
    outputFileTracingIncludes: {
      '.*': [
        // './scripts/**/*',
        // './node_modules/.pnpm/esbuild*/**/*',
        // './node_modules/esbuild*/**/*',
        // './node_modules/.pnpm/tsx*/**/*',
        // './node_modules/tsx*/**/*',
        './node_modules/zx/**/*',
        './node_modules/dotenv/**/*',
        // './node_modules/.bin/*',
      ],
    },
    typescript: {
      ignoreBuildErrors: Boolean(process.env.IGNORE_BUILD_ERRORS),
    }
  }
  return nextConfig
}

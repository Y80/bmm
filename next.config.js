import nextConst from 'next/constants.js';
import { checkEnvs, tryLoadParentGitRepoEnv } from './scripts/utils.mjs';

async function tryLoadCodeInspector() {
  if (process.env.NODE_ENV !== 'development') return null
  const { codeInspectorPlugin } = await import('code-inspector-plugin');
  return codeInspectorPlugin({
    bundler: 'webpack',
    hideDomPathAttr: true,
    editor: process.env.CODE_INSPECTOR_EDITOR || undefined
  })
}

export default async function setup(phase) {
  tryLoadParentGitRepoEnv()

  if (phase === nextConst.PHASE_DEVELOPMENT_SERVER || phase === nextConst.PHASE_PRODUCTION_SERVER) {
    checkEnvs()
  }

  const domainHost = new URL(process.env.AUTH_URL || 'http://localhost').host

  const codeInspector = await tryLoadCodeInspector()

  /** @type {import('next').NextConfig} */
  const nextConfig = {
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
    webpack: (config, { webpack, nextRuntime }) => {
      codeInspector && config.plugins.push(codeInspector)
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
      serverActions: { allowedOrigins: [domainHost] }
    }
  }
  return nextConfig
}

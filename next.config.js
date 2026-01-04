import nextConst from 'next/constants.js';
import { checkEnvs, tryLoadParentGitRepoEnv } from './scripts/utils.mjs';

let codeInspectorPlugin;
if (process.env.NODE_ENV === 'development') {
  const { codeInspectorPlugin: plugin } = await import('code-inspector-plugin');
  codeInspectorPlugin = plugin;
}

export default async function setup(phase) {
  tryLoadParentGitRepoEnv()

  if (phase === nextConst.PHASE_DEVELOPMENT_SERVER || phase === nextConst.PHASE_PRODUCTION_SERVER) {
    checkEnvs()
  }

  const domainHost = new URL(process.env.AUTH_URL || 'http://localhost').host

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
    turbopack: {
      rules: codeInspectorPlugin ? codeInspectorPlugin({
        bundler: 'turbopack',
        hideDomPathAttr: true,
      }) : undefined
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
      serverActions: { allowedOrigins: [domainHost] }
    },
    typescript: {
      ignoreBuildErrors: Boolean(process.env.IGNORE_BUILD_ERRORS),
    }
  }
  return nextConfig
}

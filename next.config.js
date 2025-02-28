import { codeInspectorPlugin } from 'code-inspector-plugin'
import { checkEnvs, tryLoadParentGitRepoEnv } from './scripts/utils.js'

export default async function setup() {
  tryLoadParentGitRepoEnv()
  checkEnvs()

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

    webpack: (config, { webpack, nextRuntime }) => {
      config.plugins.push(codeInspectorPlugin({ bundler: 'webpack', hideDomPathAttr: true }))
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

import { codeInspectorPlugin } from 'code-inspector-plugin'
import { checkEnvs, tryLoadParentGitRepoEnv } from './scripts/utils.js'

export default async function setup() {
  tryLoadParentGitRepoEnv()
  checkEnvs()

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

    webpack: (config) => {
      config.plugins.push(codeInspectorPlugin({ bundler: 'webpack', hideDomPathAttr: false }))
      return config
    },
  }
  return nextConfig
}

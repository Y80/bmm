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
    experimental: {
      serverActions: { allowedOrigins: [domainHost] }
    },
    typescript: {
      ignoreBuildErrors: Boolean(process.env.IGNORE_BUILD_ERRORS),
    }
  }
  return nextConfig
}

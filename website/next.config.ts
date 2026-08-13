import { withGuildDocs } from '@theguild/components/next.config';

export default withGuildDocs({
  output: 'export',
  // typescript@7 has no JS compiler API; Next's build-time typecheck still needs it.
  // Twoslash/eslint use the postinstall API shim. Skip Next typechecking for now.
  typescript: {
    ignoreBuildErrors: true,
  },
  redirects: async () =>
    Object.entries({
      '/handbook/other-integrations/federation-services':
        '/handbook/other-integrations/federation-to-stitching-sdl',
    }).map(([from, to]) => ({
      destination: to,
      permanent: true,
      source: from,
    })),
  env: {
    SITE_URL: 'https://the-guild.dev/graphql/stitching',
  },
});

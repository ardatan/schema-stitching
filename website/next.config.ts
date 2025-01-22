import { withGuildDocs } from '@theguild/components/next.config';

export default withGuildDocs({
  output: 'export',
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

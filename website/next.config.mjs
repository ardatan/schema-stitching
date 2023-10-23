import { withGuildDocs } from '@theguild/components/next.config';

export default withGuildDocs({
  redirects: () =>
    Object.entries({
      '/handbook/other-integrations/federation-services':
        '/handbook/other-integrations/federation-to-stitching-sdl',
    }).map(([from, to]) => ({
      destination: to,
      permanent: true,
      source: from,
    })),
});

/* eslint sort-keys: error */
import { defineConfig, Giscus, useTheme } from '@theguild/components';
import { useRouter } from 'next/router';

export default defineConfig({
  docsRepositoryBase: 'https://github.com/ardatan/schema-stitching/tree/master/website',
  main({ children }) {
    const { resolvedTheme } = useTheme();
    const { route } = useRouter();

    const comments = route !== '/' && (
      <Giscus
        // ensure giscus is reloaded when client side route is changed
        key={route}
        repo="the-guild-org/stitching-website"
        repoId="MDEwOlJlcG9zaXRvcnk1NDQzMjE2OA=="
        category="Docs Discussions"
        categoryId="DIC_kwDOAz6RqM4CSDSV"
        mapping="pathname"
        theme={resolvedTheme}
      />
    );
    return (
      <>
        {children}
        {comments}
      </>
    );
  },
  siteName: 'STITCHING',
});

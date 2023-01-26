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
        repo="ardatan/schema-stitching"
        repoId="R_kgDOIvpJ-Q"
        category="Documentation"
        categoryId="DIC_kwDOIvpJ-c4CT0ET"
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

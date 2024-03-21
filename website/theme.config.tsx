/* eslint sort-keys: error */
import { useRouter } from 'next/router';
import { defineConfig, Giscus, PRODUCTS, useTheme } from '@theguild/components';

export default defineConfig({
  description: PRODUCTS.STITCHING.title,
  docsRepositoryBase: 'https://github.com/ardatan/schema-stitching/tree/master/website',
  logo: PRODUCTS.STITCHING.logo,
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
  websiteName: 'STITCHING',
});

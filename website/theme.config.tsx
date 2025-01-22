/* eslint sort-keys: error */
import { defineConfig, PRODUCTS } from '@theguild/components';

export default defineConfig({
  description: PRODUCTS.STITCHING.title,
  docsRepositoryBase: 'https://github.com/ardatan/schema-stitching/tree/master/website',
  logo: PRODUCTS.STITCHING.logo({ className: 'w-9' }),
  websiteName: 'Schema Stitching',
});

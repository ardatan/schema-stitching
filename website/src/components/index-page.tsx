import { ReactElement } from 'react';
import { FeatureList, HeroGradient, IFeatureListProps } from '@theguild/components';

import needle from 'public/assets/needle.svg';

const FEATURE_LIST: IFeatureListProps['items'] = [
  // {
  //     title: 'Stitch Multiple Schemas',
  //     description:
  //         'Automatically stitch multiple schemas together into one larger API in a simple, fast and powerful way.',
  //     image: {
  //         src: needle,
  //         alt: '',
  //         loading: 'eager',
  //         placeholder: 'empty',
  //     },
  //     link: {
  //         children: 'Learn more',
  //         href: '/docs/introduction',
  //     },
  // },
];

export function IndexPage(): ReactElement {
  return (
    <>
      <HeroGradient
        title="Stitch Multiple Schemas"
        description="Automatically stitch multiple schemas together into one larger API in a simple, fast and powerful way."
        link={{
          children: 'Get Started',
          title: 'Learn more about Schema Stitching',
          href: '/docs',
        }}
        image={{
          src: needle,
          alt: '',
          loading: 'eager',
          placeholder: 'empty',
        }}
        colors={['#000246', '#184BE6']}
      />
      <FeatureList items={FEATURE_LIST} className="[&_h3]:mt-6" />
    </>
  );
}

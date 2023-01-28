import { ReactElement, ReactNode } from 'react';
import clsx from 'clsx';
import { FiGithub } from 'react-icons/fi';
import { Anchor, IFeatureListProps } from '@theguild/components';

const classes = {
  button:
    'inline-block bg-gray-200 hover:bg-gray-300 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700 text-gray-600 px-6 py-3 rounded-lg font-medium shadow-sm',
  link: 'text-primary-500',
};

export function IndexPage(): ReactElement {
  return (
    <>
      <FeatureWrapper>
        <div className="container py-20 sm:py-24 lg:py-32">
          <h1 className="max-w-screen-md mx-auto font-extrabold text-5xl sm:text-5xl lg:text-6xl text-center bg-gradient-to-r from-purple-700 to-fuchsia-400 dark:from-purple-700 dark:to-fuchsia-400 bg-clip-text text-transparent !leading-tight">
            Schema Stitching
          </h1>
          <p className="max-w-screen-sm mx-auto mt-6 text-2xl text-gray-600 text-center dark:text-gray-400">
            Automatically stitch multiple schemas together into one larger API in a simple, fast and
            powerful way.
          </p>
          <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Anchor className={classes.button} href="/docs">
              Documentation
            </Anchor>
            <Anchor className={clsx(classes.button, 'hidden lg:block')} href="/handbook">
              Handbook
            </Anchor>
            <Anchor
              className={clsx(classes.button, 'flex flex-row gap-2 items-center')}
              href="https://github.com/ardatan/schema-stitching"
            >
              <FiGithub /> GitHub
            </Anchor>
          </div>
        </div>
      </FeatureWrapper>
    </>
  );
}

function FeatureWrapper({ children }: { children: ReactNode }): ReactElement {
  return (
    <div
      className={`
        w-full py-24
        odd:bg-gray-50
        odd:dark:bg-gray-900
        even:bg-white
        even:dark:bg-black
      `}
    >
      {children}
    </div>
  );
}

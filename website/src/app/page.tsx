import {
  CallToAction,
  DecorationIsolation,
  GitHubIcon,
  Hero,
  HeroLogo,
  HighlightDecoration,
  StitchingLogo,
  ToolsAndLibrariesCards,
} from '@theguild/components';
import { metadata as rootMetadata } from './layout';

export const metadata = {
  alternates: {
    // to remove leading slash
    canonical: '.',
  },
  openGraph: {
    ...rootMetadata!.openGraph,
    // to remove leading slash
    url: '.',
  },
};

export default function IndexPage() {
  return (
    <div className="flex h-full flex-col mx-auto max-w-[90rem] overflow-hidden">
      <Hero
        heading="Schema Stitching"
        text="Automatically stitch multiple schemas together into one larger API in a simple, fast and powerful way."
        top={
          <HeroLogo>
            <StitchingLogo className="stroke-none size-[60px]" />
          </HeroLogo>
        }
        checkmarks={['Fully open source', 'No vendor lock']}
        // Original logo has some issues with overflowing <path> elements
        className="[&_.-z-10>svg]:fill-[#B0CBD1]"
      >
        <CallToAction variant="primary-inverted" href="/docs">
          Get started
        </CallToAction>
        <CallToAction variant="secondary-inverted" href="/handbook">
          Handbook
        </CallToAction>
        <CallToAction variant="tertiary" href="https://github.com/ardatan/schema-stitching">
          <GitHubIcon className="size-6" />
          GitHub
        </CallToAction>
        <Decoration />
      </Hero>
      <ToolsAndLibrariesCards className="mx-4 mt-6 md:mx-6" />
    </div>
  );
}

function Decoration() {
  return (
    <DecorationIsolation className="max-sm:opacity-75 dark:opacity-10">
      <GradientDefs
        gradientId="case-studies-hero-gradient"
        stops={
          <>
            <stop stopColor="white" stopOpacity="0.1" />
            <stop offset="1" stopColor="white" stopOpacity="0.3" />
          </>
        }
      />
      <ArchDecoration
        gradientId="case-studies-hero-gradient"
        className="absolute left-[-180px] top-0 rotate-180 max-md:h-[155px] sm:left-[-100px] xl:left-0"
      />
      <ArchDecoration
        gradientId="case-studies-hero-gradient"
        className="absolute bottom-0 right-[-180px] max-md:h-[155px] sm:right-[-100px] xl:right-0"
      />
      <HighlightDecoration className="pointer-events-none absolute right-0 top-[-22px] overflow-visible" />
    </DecorationIsolation>
  );
}

function ArchDecoration(props: { className?: string; gradientId: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="385"
      height="220"
      viewBox="0 0 385 220"
      fill="none"
      className={props.className}
    >
      <path
        d="M8.34295e-06 190.864C7.8014e-06 178.475 4.93233 166.577 13.6983 157.811L81.769 89.7401L89.7401 81.769L157.811 13.6983C166.577 4.93231 178.475 -7.8014e-06 190.864 -8.34295e-06L585 -1.87959e-05L585 89.7401L159.868 89.7401C121.134 89.7401 89.7401 121.134 89.7401 159.868L89.7402 228L1.87959e-05 228L8.34295e-06 190.864Z"
        fill={`url(#${props.gradientId})`}
      />
    </svg>
  );
}

function GradientDefs(props: { gradientId: string; stops: React.ReactNode }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="385"
      height="220"
      viewBox="0 0 385 220"
      fill="none"
      className="absolute size-0"
    >
      <defs>
        <linearGradient
          id={props.gradientId}
          x1="71.4243"
          y1="25.186"
          x2="184.877"
          y2="282.363"
          gradientUnits="userSpaceOnUse"
        >
          {props.stops}
        </linearGradient>
      </defs>
    </svg>
  );
}

import type { StorybookConfig } from '@storybook/react-vite';
import remarkGfm from 'remark-gfm';

const config: StorybookConfig = {
  stories: ['../src/**/*.mdx', '../src/**/*.stories.@(ts|tsx)'],
  addons: [
    // GitHub-flavoured Markdown (tables) is not on by default in Storybook MDX.
    { name: '@storybook/addon-docs', options: { mdxPluginOptions: { mdxCompileOptions: { remarkPlugins: [remarkGfm] } } } },
    '@storybook/addon-a11y',
    // Forces :hover / :active / :focus-visible on chosen elements for side-by-side state review.
    'storybook-addon-pseudo-states',
    // Runs every story's play function and the accessibility checks with `npm run test:stories`.
    '@storybook/addon-vitest',
  ],
  framework: { name: '@storybook/react-vite', options: {} },
  core: { disableTelemetry: true },
};

export default config;

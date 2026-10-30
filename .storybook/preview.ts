import type { Preview } from '@storybook/react-vite';
import '../src/styles/globals.css';
import '../src/foundations/foundations.css';

const preview: Preview = {
  parameters: {
    // Accessibility violations fail `npm run test:stories`.
    a11y: { test: 'error' },
    options: {
      storySort: {
        order: [
          'Introduction',
          'Using tokens',
          'Colors', ['Primitives', 'Semantic', 'Context and appearance'],
          'Size', ['Spacing', 'Radius and stroke'],
          'Typography',
          'Component tokens',
          'Components',
        ],
      },
    },
  },
};

export default preview;

import path from 'node:path';
import { defineConfig, mergeConfig } from 'vitest/config';
import { storybookTest } from '@storybook/addon-vitest/vitest-plugin';
import { playwright } from '@vitest/browser-playwright';
import viteConfig from './vite.config';

// Runs every Storybook story as a test in Chromium: render, play function, accessibility (axe).
export default mergeConfig(
  viteConfig,
  defineConfig({
    plugins: [storybookTest({ configDir: path.join(import.meta.dirname, '.storybook') })],
    test: {
      name: 'storybook',
      browser: {
        enabled: true,
        headless: true,
        provider: playwright({}),
        instances: [{ browser: 'chromium' }],
      },
    },
  }),
);

import type { Meta, StoryObj } from '@storybook/react-vite';
import { Download, Filter, Plus, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';

const meta = {
  title: 'Components/Button',
  component: Button,
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component:
          'Stock shadcn/ui Button (new-york-v4), unchanged except the import path. Colours, radius and focus ring come from the design tokens through `src/styles/globals.css`. Variants and sizes are still shadcn\'s, not the Figma Button\'s.',
      },
    },
  },
  args: { children: 'Approve withdrawal' },
  argTypes: {
    variant: { control: 'select', options: ['default', 'secondary', 'outline', 'ghost', 'destructive', 'link'] },
    size: { control: 'select', options: ['xs', 'sm', 'default', 'lg', 'icon-xs', 'icon-sm', 'icon', 'icon-lg'] },
  },
} satisfies Meta<typeof Button>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Playground: Story = {};

export const Variants: Story = {
  render: () => (
    <div className="flex flex-wrap items-center gap-3">
      <Button>Approve withdrawal</Button>
      <Button variant="secondary">Export CSV</Button>
      <Button variant="outline"><Filter /> Filters</Button>
      <Button variant="ghost">Cancel</Button>
      <Button variant="destructive"><Trash2 /> Block account</Button>
      <Button variant="link">View audit log</Button>
    </div>
  ),
};

export const Sizes: Story = {
  render: () => (
    <div className="flex flex-wrap items-center gap-3">
      <Button size="xs">Extra small</Button>
      <Button size="sm">Small</Button>
      <Button>Default</Button>
      <Button size="lg">Large</Button>
      <Button size="icon-xs" aria-label="Add"><Plus /></Button>
      <Button size="icon-sm" aria-label="Add"><Plus /></Button>
      <Button size="icon" aria-label="Add"><Plus /></Button>
      <Button size="icon-lg" aria-label="Download"><Download /></Button>
    </div>
  ),
};

export const Disabled: Story = { args: { disabled: true } };

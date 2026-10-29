import type { Meta, StoryObj } from '@storybook/react-vite';
import { BadgeCheck } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

const meta = {
  title: 'Components/Badge',
  component: Badge,
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component:
          'Stock shadcn/ui Badge, themed by the tokens. shadcn has six variants; the Figma Badge has 7 intents (Context) x 3 treatments (Appearance) and two shapes, so this is the component that will change most.',
      },
    },
  },
  args: { children: 'Verified' },
  argTypes: { variant: { control: 'select', options: ['default', 'secondary', 'destructive', 'outline', 'ghost', 'link'] } },
} satisfies Meta<typeof Badge>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Playground: Story = {};

export const Variants: Story = {
  render: () => (
    <div className="flex flex-wrap items-center gap-3">
      <Badge><BadgeCheck /> Verified</Badge>
      <Badge variant="secondary">Pending review</Badge>
      <Badge variant="destructive">Blocked</Badge>
      <Badge variant="outline">KYC level 2</Badge>
    </div>
  ),
};

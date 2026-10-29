import type { Meta, StoryObj } from '@storybook/react-vite';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

const meta = {
  title: 'Components/Input',
  component: Input,
  tags: ['autodocs'],
  parameters: {
    docs: { description: { component: 'Stock shadcn/ui Input and Label, themed by the tokens. Height is shadcn\'s 36px; the Figma Input sizes are 32 / 40 / 48.' } },
  },
  args: { placeholder: '0x71C7656EC7ab88b098defB751B7401B5f6d8976F' },
} satisfies Meta<typeof Input>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Playground: Story = {};

export const WithLabel: Story = {
  render: (args) => (
    <div className="grid w-96 gap-2">
      <Label htmlFor="wallet">Wallet address</Label>
      <Input id="wallet" {...args} />
    </div>
  ),
};

export const States: Story = {
  render: () => (
    <div className="grid w-96 gap-5">
      <div className="grid gap-2">
        <Label htmlFor="amount">Withdrawal limit, USDT</Label>
        <Input id="amount" defaultValue="25,000.00" />
      </div>
      <div className="grid gap-2">
        <Label htmlFor="ref">Reference</Label>
        <Input id="ref" aria-invalid aria-describedby="ref-error" defaultValue="WD-2026-10-" />
        <p id="ref-error" className="text-sm text-destructive">Reference must end with a 6-digit number.</p>
      </div>
      <div className="grid gap-2">
        <Label htmlFor="uid">Customer ID</Label>
        <Input id="uid" disabled defaultValue="CU-0048213" />
      </div>
    </div>
  ),
};

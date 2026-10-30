import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, userEvent, waitFor, within } from 'storybook/test';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectTrigger, SelectValue } from '@/components/ui/select';

const meta = {
  title: 'Components/Select',
  component: Select,
  tags: ['autodocs'],
  parameters: {
    docs: { description: { component: 'Stock shadcn/ui Select (Radix), themed by the tokens. The Keyboard story runs a test: open with the keyboard, move down one option, choose it.' } },
  },
} satisfies Meta<typeof Select>;

export default meta;
type Story = StoryObj<typeof meta>;

const NetworkSelect = () => (
  <div className="grid w-72 gap-2">
    <Label htmlFor="network">Network</Label>
    <Select defaultValue="eth">
      <SelectTrigger id="network" className="w-full">
        <SelectValue placeholder="Choose a network" />
      </SelectTrigger>
      <SelectContent>
        <SelectGroup>
          <SelectLabel>USDT networks</SelectLabel>
          <SelectItem value="eth">Ethereum (ERC-20)</SelectItem>
          <SelectItem value="trx">Tron (TRC-20)</SelectItem>
          <SelectItem value="bsc">BNB Smart Chain (BEP-20)</SelectItem>
          <SelectItem value="sol" disabled>Solana (maintenance)</SelectItem>
        </SelectGroup>
      </SelectContent>
    </Select>
  </div>
);

export const Default: Story = { render: () => <NetworkSelect /> };

export const Placeholder: Story = {
  render: () => (
    <Select>
      <SelectTrigger className="w-72" aria-label="Asset">
        <SelectValue placeholder="Choose an asset" />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="btc">BTC</SelectItem>
        <SelectItem value="eth">ETH</SelectItem>
        <SelectItem value="usdt">USDT</SelectItem>
      </SelectContent>
    </Select>
  ),
};

export const Keyboard: Story = {
  render: () => <NetworkSelect />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const trigger = canvas.getByRole('combobox', { name: 'Network' });
    await expect(trigger).toHaveTextContent('Ethereum (ERC-20)');
    trigger.focus();
    await userEvent.keyboard('{Enter}');
    const listbox = await within(canvasElement.ownerDocument.body).findByRole('listbox');
    // The menu fades in; wait for the open animation.
    await waitFor(() => expect(listbox).toBeVisible());
    await userEvent.keyboard('{ArrowDown}');
    await userEvent.keyboard('{Enter}');
    await waitFor(() => expect(trigger).toHaveTextContent('Tron (TRC-20)'));
    // Radix moves focus back to the trigger after the close animation.
    await waitFor(() => expect(trigger).toHaveFocus());
  },
};

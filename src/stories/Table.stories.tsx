import type { Meta, StoryObj } from '@storybook/react-vite';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCaption, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

const meta = {
  title: 'Components/Table',
  component: Table,
  tags: ['autodocs'],
  parameters: {
    docs: { description: { component: 'Stock shadcn/ui Table: plain HTML table markup with styles, no sorting or selection logic. Row and header heights are shadcn\'s; the Figma Table uses the Size [Table] tokens.' } },
  },
} satisfies Meta<typeof Table>;

export default meta;
type Story = StoryObj<typeof meta>;

const rows = [
  { id: 'WD-104233', customer: 'Anna Petrosyan', asset: 'USDT', amount: '1,250.00', status: 'Completed', date: '28 Oct 2026, 14:05' },
  { id: 'WD-104232', customer: 'Lucas Moreau', asset: 'BTC', amount: '0.0421', status: 'Pending', date: '28 Oct 2026, 13:51' },
  { id: 'WD-104231', customer: 'Kenji Watanabe', asset: 'ETH', amount: '3.5000', status: 'Rejected', date: '28 Oct 2026, 13:20' },
  { id: 'WD-104230', customer: 'Maria Lopez', asset: 'USDT', amount: '18,400.00', status: 'Completed', date: '28 Oct 2026, 12:47' },
];
const variant = { Completed: 'secondary', Pending: 'outline', Rejected: 'destructive' } as const;

export const Withdrawals: Story = {
  render: () => (
    <Table>
      <TableCaption>Latest withdrawals</TableCaption>
      <TableHeader>
        <TableRow>
          <TableHead>ID</TableHead>
          <TableHead>Customer</TableHead>
          <TableHead>Asset</TableHead>
          <TableHead className="text-right">Amount</TableHead>
          <TableHead>Status</TableHead>
          <TableHead>Date</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {rows.map((r) => (
          <TableRow key={r.id}>
            <TableCell className="font-mono text-xs">{r.id}</TableCell>
            <TableCell>{r.customer}</TableCell>
            <TableCell>{r.asset}</TableCell>
            <TableCell className="text-right font-mono">{r.amount}</TableCell>
            <TableCell><Badge variant={variant[r.status as keyof typeof variant]}>{r.status}</Badge></TableCell>
            <TableCell className="text-muted-foreground">{r.date}</TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  ),
};

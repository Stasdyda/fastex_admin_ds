import type { Meta, StoryObj } from '@storybook/react-vite';
import type { ReactNode } from 'react';
import { expect, fn, userEvent, within } from 'storybook/test';
import { Button, type ButtonSize, type ButtonVariant } from '@/components/ui/button';
import { IconAdd, IconSettings } from '@/components/icons/figma-icons';

const icons = { add: <IconAdd />, settings: <IconSettings /> };
type IconName = keyof typeof icons;

/** Controls mirror the Figma component properties. */
interface PlaygroundArgs {
  text: string;
  variant: ButtonVariant;
  size: ButtonSize;
  danger: boolean;
  disabled: boolean;
  loading: boolean;
  hasStartItem: boolean;
  startItem: IconName;
  hasEndItem: boolean;
  endItem: IconName;
  onClick: () => void;
}

const meta = {
  title: 'Components/Button',
  component: Button,
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component: [
          'Code version of the Figma component **Button** (node 89:406). Behaviour comes from a native `<button>` (shadcn/ui pattern, Radix Slot for `asChild`); every visual value is a design token.',
          '',
          '| Figma property | React prop |',
          '|---|---|',
          '| Type: Primary, Secondary, Ghost | `variant` |',
          '| Size [Button] mode: s, m, l | `size` (default `s`, as in Figma) |',
          '| State: Hover, Pressed, Focused | real CSS states |',
          '| State: Disabled | `disabled` |',
          '| State: Loading | `loading` |',
          '| State: Danger | `danger` (combines with every other state) |',
          '| Has start item + Start item | `startIcon` |',
          '| Has end item + End item | `endIcon` |',
          '| Text | `children` |',
        ].join('\n'),
      },
    },
  },
} satisfies Meta<typeof Button>;

export default meta;
type Story = StoryObj<typeof meta>;

/* ---------- 1. Playground ---------- */
export const Playground: StoryObj<PlaygroundArgs> = {
  args: {
    text: 'Button',
    variant: 'primary',
    size: 's',
    danger: false,
    disabled: false,
    loading: false,
    hasStartItem: true,
    startItem: 'add',
    hasEndItem: true,
    endItem: 'settings',
    onClick: fn(),
  },
  argTypes: {
    text: { name: 'Text', control: 'text' },
    variant: { name: 'Type', control: 'inline-radio', options: ['primary', 'secondary', 'ghost'] },
    size: { name: 'Size [Button]', control: 'inline-radio', options: ['s', 'm', 'l'] },
    danger: { name: 'Danger', control: 'boolean' },
    disabled: { name: 'Disabled', control: 'boolean' },
    loading: { name: 'Loading', control: 'boolean' },
    hasStartItem: { name: 'Has start item', control: 'boolean' },
    startItem: { name: 'Start item', control: 'select', options: ['add', 'settings'], if: { arg: 'hasStartItem' } },
    hasEndItem: { name: 'Has end item', control: 'boolean' },
    endItem: { name: 'End item', control: 'select', options: ['add', 'settings'], if: { arg: 'hasEndItem' } },
    onClick: { table: { disable: true } },
  },
  render: ({ text, hasStartItem, startItem, hasEndItem, endItem, ...rest }) => (
    <Button {...rest} startIcon={hasStartItem ? icons[startItem] : undefined} endIcon={hasEndItem ? icons[endItem] : undefined}>
      {text}
    </Button>
  ),
};

/* ---------- 2. Matrix: Type x Size x Danger, resting state ---------- */
const variants: ButtonVariant[] = ['primary', 'secondary', 'ghost'];
const sizes: ButtonSize[] = ['s', 'm', 'l'];

function Grid({ columns, children }: { columns: number; children: ReactNode }) {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: `120px repeat(${columns}, max-content)`, gap: 16, alignItems: 'center', fontFamily: 'var(--ds-font-family-default)', fontSize: 12, color: 'var(--ds-text-secondary)' }}>
      {children}
    </div>
  );
}

export const Matrix: Story = {
  parameters: { docs: { description: { story: 'Every Type at every size, normal and danger. Hover, press or tab to a button to see its live states.' } } },
  render: () => (
    <Grid columns={6}>
      <span />
      {sizes.flatMap((s) => [<span key={s}>size {s}</span>, <span key={s + 'd'}>size {s}, danger</span>])}
      {variants.map((v) => (
        <Row key={v} label={v}>
          {sizes.flatMap((s) =>
            [false, true].map((danger) => (
              <Button key={`${s}-${danger}`} data-testid={`matrix-${v}-${s}${danger ? '-danger' : ''}`} variant={v} size={s} danger={danger} startIcon={<IconAdd />} endIcon={<IconSettings />}>
                Button
              </Button>
            )),
          )}
        </Row>
      ))}
    </Grid>
  ),
};

function Row({ label, children }: { label: string; children: ReactNode }) {
  return (
    <>
      <span style={{ textTransform: 'capitalize' }}>{label}</span>
      {children}
    </>
  );
}

/* ---------- 3. States: the Figma grid (Type rows x State columns) ---------- */
const stateColumns = ['Default', 'Hover', 'Pressed', 'Focused', 'Disabled', 'Loading', 'Danger'] as const;

export const States: Story = {
  parameters: {
    docs: {
      description: {
        story:
          'Same layout as the Figma component set. Hover, Pressed and Focused are forced for review with the pseudo-states addon; the real buttons use :hover, :active and :focus-visible. The second block shows the danger states that Figma does not draw (derived, pending design sign-off).',
      },
    },
    pseudo: {
      hover: ['[data-force="hover"]'],
      active: ['[data-force="pressed"]'],
      focusVisible: ['[data-force="focused"]'],
    },
  },
  render: () => (
    <div style={{ display: 'grid', gap: 32 }}>
      <StateGrid danger={false} />
      <StateGrid danger />
    </div>
  ),
};

function StateGrid({ danger }: { danger: boolean }) {
  const cols = danger ? stateColumns.slice(0, 6) : stateColumns;
  return (
    <Grid columns={cols.length}>
      <span>{danger ? 'Danger +' : ''}</span>
      {cols.map((c) => (
        <span key={c}>{c}</span>
      ))}
      {variants.map((v) => (
        <Row key={v} label={v}>
          {cols.map((c) => (
            <Button
              key={c}
              data-testid={`state-${v}-${c.toLowerCase()}${danger ? '-danger' : ''}`}
              variant={v}
              danger={danger || c === 'Danger'}
              disabled={c === 'Disabled'}
              loading={c === 'Loading'}
              data-force={c === 'Hover' ? 'hover' : c === 'Pressed' ? 'pressed' : c === 'Focused' ? 'focused' : undefined}
              startIcon={<IconAdd />}
              endIcon={<IconSettings />}
            >
              Button
            </Button>
          ))}
        </Row>
      ))}
    </Grid>
  );
}

/* ---------- 4. Content stress test ---------- */
export const Content: Story = {
  parameters: { docs: { description: { story: 'Figma labels do not wrap or truncate, so a long label widens the button. The last row shows what happens in a container narrower than the label.' } } },
  render: () => (
    <div style={{ display: 'grid', gap: 16, justifyItems: 'start' }}>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12, alignItems: 'center' }}>
        <Button>OK</Button>
        <Button startIcon={<IconAdd />}>Add customer</Button>
        <Button variant="secondary" endIcon={<IconSettings />}>Settings</Button>
        <Button variant="ghost">Cancel</Button>
        <Button variant="secondary" danger startIcon={<IconAdd />} endIcon={<IconSettings />}>Block</Button>
      </div>
      <Button size="m" startIcon={<IconAdd />} endIcon={<IconSettings />}>
        Approve all pending withdrawals for verified customers
      </Button>
      <Button size="m" variant="secondary">Подтвердить вывод средств</Button>
      <div style={{ width: 200, padding: 8, outline: '1px dashed var(--ds-stroke-strong)' }}>
        <Button variant="secondary" startIcon={<IconAdd />}>Export transactions to CSV</Button>
      </div>
    </div>
  ),
};

/* ---------- 5. Interaction tests ---------- */
export const ClickAndKeyboard: Story = {
  args: { onClick: fn(), children: 'Approve withdrawal' },
  play: async ({ args, canvasElement, step }) => {
    const button = within(canvasElement).getByRole('button', { name: 'Approve withdrawal' });
    await step('Pointer click fires onClick', async () => {
      await userEvent.click(button);
      await expect(args.onClick).toHaveBeenCalledTimes(1);
    });
    await step('Tab focuses it and shows the 2px focus ring', async () => {
      button.blur();
      await userEvent.tab();
      await expect(button).toHaveFocus();
      await expect(button.matches(':focus-visible')).toBe(true);
      await expect(getComputedStyle(button).boxShadow).toContain('2px');
    });
    await step('Enter and Space activate it', async () => {
      await userEvent.keyboard('{Enter}');
      await userEvent.keyboard(' ');
      await expect(args.onClick).toHaveBeenCalledTimes(3);
    });
  },
};

export const DisabledBlocksInput: Story = {
  args: { onClick: fn(), disabled: true, children: 'Approve withdrawal' },
  play: async ({ args, canvasElement }) => {
    const button = within(canvasElement).getByRole('button', { name: 'Approve withdrawal' });
    await expect(button).toBeDisabled();
    await userEvent.click(button, { pointerEventsCheck: 0 });
    await userEvent.tab();
    await expect(button).not.toHaveFocus();
    await expect(args.onClick).not.toHaveBeenCalled();
  },
};

export const LoadingBlocksClicks: Story = {
  args: { onClick: fn(), loading: true, children: 'Saving' },
  play: async ({ args, canvasElement }) => {
    const button = within(canvasElement).getByRole('button', { name: 'Saving' });
    await expect(button).toHaveAttribute('aria-busy', 'true');
    await userEvent.click(button);
    await userEvent.tab({ shift: true });
    await userEvent.tab();
    await expect(button).toHaveFocus();
    await userEvent.keyboard('{Enter}');
    await expect(args.onClick).not.toHaveBeenCalled();
  },
};

export const AsLink: Story = {
  parameters: { docs: { description: { story: '`asChild` renders the child element, here a link, with the button styles. Icons still work.' } } },
  render: () => (
    <Button asChild variant="secondary" startIcon={<IconAdd />}>
      <a href="#customers">Open customers</a>
    </Button>
  ),
  play: async ({ canvasElement }) => {
    const link = within(canvasElement).getByRole('link', { name: 'Open customers' });
    await expect(link).toHaveAttribute('data-slot', 'button');
    await expect(link).toHaveClass('ds-button');
    await expect(link.querySelector('[data-slot="button-start-icon"]')).not.toBeNull();
  },
};

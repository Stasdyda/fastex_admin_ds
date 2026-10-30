import * as React from 'react';
import { Slot } from 'radix-ui';
import { cn } from '@/lib/utils';
import './button.css';

/*
  Button: code version of the Figma component "Button" (89:406).

  Figma property                  -> React prop
  Type = Primary | Secondary | Ghost -> variant (`type` is taken by the HTML button attribute)
  State = Default / Hover / Pressed / Focused -> real CSS states (:hover, :active, :focus-visible)
  State = Disabled                -> disabled
  State = Loading                 -> loading
  State = Danger                  -> danger (a modifier, so it combines with hover, focus, disabled, loading)
  Size [Button] mode = s | m | l  -> size (sets data-button-size, which switches the --ds-button-* tokens)
  Has start item + Start item     -> startIcon
  Has end item + End item         -> endIcon
  Text                            -> children

  Behaviour kept from shadcn/ui: native <button>, `asChild` via Radix Slot (e.g. render a link),
  data-slot="button", type="button" by default.
*/

export type ButtonVariant = 'primary' | 'secondary' | 'ghost';
export type ButtonSize = 's' | 'm' | 'l';

export interface ButtonProps extends Omit<React.ComponentProps<'button'>, 'children'> {
  /** Figma "Type". */
  variant?: ButtonVariant;
  /** Figma "Size [Button]" mode. Figma's component default is s. */
  size?: ButtonSize;
  /** Figma "State = Danger": destructive action. */
  danger?: boolean;
  /** Figma "State = Loading". The button stays focusable, announces aria-busy and ignores clicks. */
  loading?: boolean;
  /** Figma "Start item". Omit for "Has start item = false". */
  startIcon?: React.ReactNode;
  /** Figma "End item". Omit for "Has end item = false". */
  endIcon?: React.ReactNode;
  /** Render the child element (e.g. <a>) with the button's styles and behaviour. */
  asChild?: boolean;
  children?: React.ReactNode;
}

function Button({
  variant = 'primary',
  size = 's',
  danger = false,
  loading = false,
  startIcon,
  endIcon,
  asChild = false,
  disabled,
  type,
  className,
  onClick,
  children,
  ...props
}: ButtonProps) {
  const Comp = asChild ? Slot.Root : 'button';
  const blocked = loading || (asChild && disabled);

  const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    if (blocked) {
      event.preventDefault();
      return;
    }
    onClick?.(event);
  };

  const start = startIcon ? (
    <span className="ds-button__icon" data-slot="button-start-icon" aria-hidden="true">
      {startIcon}
    </span>
  ) : null;
  const end = endIcon ? (
    <span className="ds-button__icon" data-slot="button-end-icon" aria-hidden="true">
      {endIcon}
    </span>
  ) : null;

  return (
    <Comp
      data-slot="button"
      data-variant={variant}
      data-button-size={size}
      data-danger={danger || undefined}
      data-loading={loading || undefined}
      aria-busy={loading || undefined}
      aria-disabled={asChild && disabled ? true : undefined}
      disabled={asChild ? undefined : disabled}
      type={asChild ? undefined : (type ?? 'button')}
      className={cn('ds-button', className)}
      onClick={handleClick}
      {...props}
    >
      {start}
      {asChild ? (
        <Slot.Slottable>{children}</Slot.Slottable>
      ) : (
        children != null &&
        children !== false && (
          <span className="ds-button__label" data-slot="button-label">
            {children}
          </span>
        )
      )}
      {end}
    </Comp>
  );
}

export { Button };

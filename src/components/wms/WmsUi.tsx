'use client';

import {
  useEffect,
  type ButtonHTMLAttributes,
  type ElementType,
  type InputHTMLAttributes,
  type ReactNode,
  type SelectHTMLAttributes,
} from 'react';

import { Search, X } from 'lucide-react';

// =========================================================
// PAGE HEADER
// =========================================================

export function PageHeader({
  title,
  description,
  icon: Icon,
  action,
  className = '',
}: {
  title: string;
  description?: string;
  icon: ElementType;
  action?: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={`flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between ${className}`}
    >
      <div className="min-w-0">
        <div className="flex items-center gap-2">
          <Icon className="h-5 w-5 shrink-0 text-[#2490ef]" />

          <h1 className="text-xl font-semibold text-[#1f2937]">
            {title}
          </h1>
        </div>

        {description && (
          <p className="mt-1 text-sm text-[#7c8591]">
            {description}
          </p>
        )}
      </div>

      {action && (
        <div className="flex w-full flex-wrap items-center gap-2 sm:w-auto">
          {action}
        </div>
      )}
    </div>
  );
}

// =========================================================
// BUTTONS
// =========================================================

type WmsButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  children: ReactNode;
};

export function PrimaryButton({
  children,
  className = '',
  type = 'button',
  ...props
}: WmsButtonProps) {
  return (
    <button
      {...props}
      type={type}
      className={`inline-flex h-9 items-center justify-center gap-2 whitespace-nowrap rounded-md bg-[#2490ef] px-4 text-sm font-medium text-white shadow-sm transition hover:bg-[#1674c4] disabled:cursor-not-allowed disabled:opacity-50 ${className}`}
    >
      {children}
    </button>
  );
}

export function SecondaryButton({
  children,
  className = '',
  type = 'button',
  ...props
}: WmsButtonProps) {
  return (
    <button
      {...props}
      type={type}
      className={`inline-flex h-9 items-center justify-center gap-2 whitespace-nowrap rounded-md border border-[#dcd8d1] bg-white px-3 text-sm font-medium text-[#4b5563] transition hover:bg-[#f7f8f9] disabled:cursor-not-allowed disabled:opacity-50 ${className}`}
    >
      {children}
    </button>
  );
}

// =========================================================
// STAT CARD
// =========================================================

export function StatCard({
  label,
  value,
  hint,
  icon: Icon,
  iconColor,
  iconBg,
  className = '',
}: {
  label: string;
  value: string | number;
  hint?: string;
  icon: ElementType;
  iconColor?: string;
  iconBg?: string;
  className?: string;
}) {
  return (
    <div
      className={`rounded-lg border border-[#e5e2dc] bg-white p-4 shadow-sm ${className}`}
    >
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <p className="text-sm text-[#7c8591]">
            {label}
          </p>

          <p className="mt-2 text-2xl font-semibold text-[#1f2937]">
            {value}
          </p>

          {hint && (
            <p className="mt-1 text-xs text-[#8a929d]">
              {hint}
            </p>
          )}
        </div>

        <div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-md ${iconBg || 'bg-[#eef6ff]'}`}>
          <Icon className={`h-4 w-4 ${iconColor || 'text-[#2490ef]'}`} />
        </div>
      </div>
    </div>
  );
}

// =========================================================
// CARD
// =========================================================

export function Card({
  title,
  description,
  children,
  className = '',
  action,
}: {
  title?: string;
  description?: string;
  children: ReactNode;
  className?: string;
  action?: ReactNode;
}) {
  return (
    <section
      className={`overflow-hidden rounded-lg border border-[#e5e2dc] bg-white shadow-sm ${className}`}
    >
      {(title || description || action) && (
        <div className="flex flex-col gap-3 border-b border-[#e5e2dc] px-5 py-4 lg:flex-row lg:items-start lg:justify-between">
          <div className="min-w-0">
            {title && (
              <h2 className="text-base font-semibold text-[#1f2937]">
                {title}
              </h2>
            )}

            {description && (
              <p className="mt-0.5 text-sm text-[#7c8591]">
                {description}
              </p>
            )}
          </div>

          {action && (
            <div className="w-full shrink-0 lg:w-auto">
              {action}
            </div>
          )}
        </div>
      )}

      {children}
    </section>
  );
}

// =========================================================
// BADGE
// =========================================================

export type BadgeTone =
  | 'blue'
  | 'green'
  | 'amber'
  | 'red'
  | 'gray'
  | 'violet';

export function Badge({
  children,
  tone = 'blue',
  className = '',
}: {
  children: ReactNode;
  tone?: BadgeTone;
  className?: string;
}) {
  const map: Record<BadgeTone, string> = {
    blue:
      'border-[#d7e8f8] bg-[#eef6ff] text-[#1674c4]',

    green:
      'border-emerald-200 bg-emerald-50 text-emerald-700',

    amber:
      'border-amber-200 bg-amber-50 text-amber-700',

    red:
      'border-red-200 bg-red-50 text-red-700',

    gray:
      'border-gray-200 bg-gray-50 text-gray-600',

    violet:
      'border-violet-200 bg-violet-50 text-violet-700',
  };

  return (
    <span
      className={`inline-flex whitespace-nowrap rounded-full border px-2 py-0.5 text-xs font-medium ${map[tone]} ${className}`}
    >
      {children}
    </span>
  );
}

// =========================================================
// STATUS BADGE
// =========================================================

export function StatusBadge({
  children,
  status,
}: {
  children?: ReactNode;
  status?: string | null;
}) {
  const text = String(
    status ??
      children ??
      'Unknown'
  );

  const value =
    text.toLowerCase();

  let tone: BadgeTone =
    'gray';

  if (
    [
      'completed',
      'dispatched',
      'active',
      'ready',
      'verified',
      'resolved',
      'approved',
      'available',
      'connected',
      'delivered',
      'generated',
      'reconciled',
      'success',
      'synced',
      'released',
      'restocked',
    ].some((item) =>
      value.includes(item)
    )
  ) {
    tone = 'green';
  } else if (
    [
      'pending',
      'assigned',
      'waiting',
      'scheduled',
      'draft',
      'partial',
      'queued',
    ].some((item) =>
      value.includes(item)
    )
  ) {
    tone = 'amber';
  } else if (
    [
      'progress',
      'verification',
      'verifying',
      'counting',
      'receiving',
      'picking',
      'packing',
      'processing',
      'allocated',
      'transit',
    ].some((item) =>
      value.includes(item)
    )
  ) {
    tone = 'blue';
  } else if (
    [
      'error',
      'failed',
      'exception',
      'discrepancy',
      'blocked',
      'rejected',
      'damaged',
      'expired',
      'cancelled',
    ].some((item) =>
      value.includes(item)
    )
  ) {
    tone = 'red';
  } else if (
    [
      'hold',
      'quarantine',
    ].some((item) =>
      value.includes(item)
    )
  ) {
    tone = 'violet';
  }

  return (
    <Badge tone={tone}>
      {text}
    </Badge>
  );
}

// =========================================================
// PROGRESS
// =========================================================

export function Progress({
  value,
  label,
  right,
}: {
  value: number;
  label?: string;
  right?: string;
}) {
  const safeValue =
    Math.max(
      0,
      Math.min(
        100,
        value
      )
    );

  return (
    <div>
      {(label || right) && (
        <div className="mb-1.5 flex items-center justify-between gap-3 text-xs">
          <span className="text-[#4b5563]">
            {label}
          </span>

          <span className="text-[#7c8591]">
            {right ??
              `${safeValue}%`}
          </span>
        </div>
      )}

      <div className="h-2 overflow-hidden rounded-full bg-[#edf0f2]">
        <div
          className="h-full rounded-full bg-[#2490ef] transition-all"
          style={{
            width: `${safeValue}%`,
          }}
        />
      </div>
    </div>
  );
}

// =========================================================
// INPUT
// =========================================================

type WmsInputProps = Omit<
  InputHTMLAttributes<HTMLInputElement>,
  'onChange'
> & {
  onChange?: (
    value: string
  ) => void;
};

export function Input({
  value,
  onChange,
  className = '',
  type = 'text',
  ...props
}: WmsInputProps) {
  return (
    <input
      {...props}
      type={type}
      value={value ?? ''}
      onChange={(event) =>
        onChange?.(
          event.target.value
        )
      }
      className={`h-9 w-full rounded-md border border-[#dcd8d1] bg-white px-3 text-sm text-[#1f2937] outline-none placeholder:text-[#9aa1aa] focus:border-[#2490ef] focus:ring-2 focus:ring-[#2490ef]/10 disabled:cursor-not-allowed disabled:bg-[#f5f5f4] disabled:text-[#9ca3af] ${className}`}
    />
  );
}

// =========================================================
// SEARCH INPUT
// =========================================================

export function SearchInput({
  value,
  onChange,
  placeholder = 'Search...',
  disabled = false,
  className = '',
}: {
  value?: string;
  onChange?: (
    value: string
  ) => void;
  placeholder?: string;
  disabled?: boolean;
  className?: string;
}) {
  return (
    <div
      className={`relative w-full ${className}`}
    >
      <Search
        className="pointer-events-none absolute left-3 top-1/2 z-10 h-4 w-4 -translate-y-1/2 text-[#9aa1aa]"
        strokeWidth={2}
      />

      <input
        type="search"
        value={value ?? ''}
        disabled={disabled}
        onChange={(event) =>
          onChange?.(
            event.target.value
          )
        }
        placeholder={
          placeholder
        }
        className="h-9 w-full rounded-md border border-[#dcd8d1] bg-white pl-10 pr-3 text-sm text-[#1f2937] outline-none placeholder:text-[#9aa1aa] focus:border-[#2490ef] focus:ring-2 focus:ring-[#2490ef]/10 disabled:cursor-not-allowed disabled:bg-[#f5f5f4] disabled:text-[#9ca3af]"
      />
    </div>
  );
}

// =========================================================
// SELECT
// =========================================================

type WmsSelectProps = Omit<
  SelectHTMLAttributes<HTMLSelectElement>,
  'onChange'
> & {
  onChange?: (
    value: string
  ) => void;
  children?: ReactNode;
};

export function Select({
  value,
  onChange,
  children,
  className = '',
  ...props
}: WmsSelectProps) {
  return (
    <select
      {...props}
      value={value}
      onChange={(event) =>
        onChange?.(
          event.target.value
        )
      }
      className={`h-9 w-full rounded-md border border-[#dcd8d1] bg-white px-3 text-sm text-[#4b5563] outline-none focus:border-[#2490ef] focus:ring-2 focus:ring-[#2490ef]/10 disabled:cursor-not-allowed disabled:bg-[#f5f5f4] disabled:text-[#9ca3af] ${className}`}
    >
      {children}
    </select>
  );
}

// =========================================================
// FIELD
// =========================================================

export function Field({
  label,
  children,
  className = '',
}: {
  label: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <label
      className={`block ${className}`}
    >
      <span className="mb-1.5 block text-sm font-medium text-[#374151]">
        {label}
      </span>

      {children}
    </label>
  );
}

// =========================================================
// MODAL
// =========================================================

export function Modal({
  open,
  title,
  description,
  onClose,
  children,
  footer,
}: {
  open: boolean;
  title: string;
  description?: string;
  onClose: () => void;
  children: ReactNode;
  footer?: ReactNode;
}) {
  if (!open) {
    return null;
  }

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 p-4"
      onMouseDown={
        onClose
      }
    >
      <div
        className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-xl border border-[#e5e2dc] bg-white shadow-xl"
        onMouseDown={(
          event
        ) =>
          event.stopPropagation()
        }
      >
        <div className="flex items-start justify-between gap-4 border-b border-[#e5e2dc] px-5 py-4">
          <div className="min-w-0">
            <h3 className="text-base font-semibold text-[#1f2937]">
              {title}
            </h3>

            {description && (
              <p className="mt-1 text-sm text-[#7c8591]">
                {
                  description
                }
              </p>
            )}
          </div>

          <button
            type="button"
            aria-label="Close"
            onClick={
              onClose
            }
            className="shrink-0 rounded-md p-1.5 text-[#7c8591] transition hover:bg-[#eef3f5]"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="p-5">
          {children}
        </div>

        {footer && (
          <div className="flex flex-col-reverse gap-2 border-t border-[#e5e2dc] px-5 py-4 sm:flex-row sm:justify-end">
            {footer}
          </div>
        )}
      </div>
    </div>
  );
}

// =========================================================
// TOAST
// =========================================================

export function Toast({
  message,
  onClose,
  duration = 3000,
}: {
  message: string;
  onClose: () => void;
  duration?: number;
}) {
  useEffect(() => {
    const timer =
      window.setTimeout(
        () => {
          onClose();
        },
        duration
      );

    return () => {
      window.clearTimeout(
        timer
      );
    };
  }, [
    duration,
    message,
    onClose,
  ]);

  return (
    <div className="fixed bottom-5 right-5 z-[110] flex max-w-[calc(100vw-2rem)] items-center gap-3 rounded-lg border border-emerald-200 bg-white px-4 py-3 text-sm text-[#1f2937] shadow-lg">
      <span className="h-2 w-2 shrink-0 rounded-full bg-emerald-500" />

      <span className="min-w-0">
        {message}
      </span>

      <button
        type="button"
        aria-label="Close notification"
        onClick={
          onClose
        }
        className="ml-2 shrink-0 rounded p-1 text-[#8a929d] hover:bg-[#f3f4f6]"
      >
        <X className="h-4 w-4" />
      </button>
    </div>
  );
}

// =========================================================
// TABLE
// =========================================================

export function Table({
  headers,
  rows,
  className = '',
}: {
  headers: string[];
  rows: ReactNode[][];
  className?: string;
}) {
  return (
    <div
      className={`overflow-x-auto ${className}`}
    >
      <table className="w-full text-left">
        <thead className="bg-[#fbfaf8]">
          <tr>
            {headers.map(
              (
                header,
                index
              ) => (
                <th
                  key={`${header}-${index}`}
                  className="whitespace-nowrap px-5 py-3 text-xs font-medium uppercase tracking-wide text-[#7c8591]"
                >
                  {header}
                </th>
              )
            )}
          </tr>
        </thead>

        <tbody>
          {rows.map(
            (
              row,
              rowIndex
            ) => (
              <tr
                key={
                  rowIndex
                }
                className="border-t border-[#f0eee9] transition hover:bg-[#fcfbfa]"
              >
                {row.map(
                  (
                    cell,
                    cellIndex
                  ) => (
                    <td
                      key={
                        cellIndex
                      }
                      className="whitespace-nowrap px-5 py-3.5 text-sm text-[#4b5563]"
                    >
                      {cell}
                    </td>
                  )
                )}
              </tr>
            )
          )}
        </tbody>
      </table>
    </div>
  );
}

// =========================================================
// MINI BARS
// =========================================================

export function MiniBars({
  values,
}: {
  values: number[];
}) {
  return (
    <div className="flex h-48 items-end gap-2 rounded-lg bg-[#fbfaf8] p-4">
      {values.map(
        (
          value,
          index
        ) => (
          <div
            key={
              index
            }
            className="flex-1 rounded-t bg-[#2490ef]/80"
            style={{
              height: `${Math.max(
                0,
                Math.min(
                  100,
                  value
                )
              )}%`,
            }}
          />
        )
      )}
    </div>
  );
}

// =========================================================
// TOGGLE
// =========================================================

export function Toggle({
  checked,
  onChange,
  disabled = false,
}: {
  checked: boolean;
  onChange: (
    value: boolean
  ) => void;
  disabled?: boolean;
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={
        checked
      }
      disabled={
        disabled
      }
      onClick={() =>
        onChange(
          !checked
        )
      }
      className={`relative h-6 w-11 shrink-0 rounded-full transition ${
        checked
          ? 'bg-[#2490ef]'
          : 'bg-[#d8dde3]'
      } disabled:cursor-not-allowed disabled:opacity-50`}
    >
      <span
        className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-all ${
          checked
            ? 'left-[22px]'
            : 'left-0.5'
        }`}
      />
    </button>
  );
}

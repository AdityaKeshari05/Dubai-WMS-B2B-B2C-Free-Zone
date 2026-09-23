'use client';

import type { ElementType, ReactNode } from 'react';
import { Download, Search, X } from 'lucide-react';

export type Tone = 'blue' | 'green' | 'amber' | 'red' | 'gray' | 'violet';

export function AnalyticsHeader({
  title,
  description,
  icon: Icon,
  children,
}: {
  title: string;
  description: string;
  icon: ElementType;
  children?: ReactNode;
}) {
  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <div className="flex items-center gap-2">
          <Icon className="h-5 w-5 text-[#2490ef]" />
          <h1 className="text-xl font-semibold text-[#1f2937]">{title}</h1>
        </div>
        <p className="mt-1 text-sm text-[#7c8591]">{description}</p>
      </div>
      {children ? <div className="flex flex-wrap items-center gap-2">{children}</div> : null}
    </div>
  );
}

export function MetricCard({
  label,
  value,
  hint,
  icon: Icon,
}: {
  label: string;
  value: string;
  hint?: string;
  icon: ElementType;
}) {
  return (
    <div className="rounded-lg border border-[#e5e2dc] bg-white p-4 shadow-sm">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-sm text-[#7c8591]">{label}</p>
          <p className="mt-2 text-2xl font-semibold text-[#1f2937]">{value}</p>
          {hint ? <p className="mt-1 text-xs text-[#8a929d]">{hint}</p> : null}
        </div>
        <div className="flex h-9 w-9 items-center justify-center rounded-md bg-[#eef6ff]">
          <Icon className="h-4 w-4 text-[#2490ef]" />
        </div>
      </div>
    </div>
  );
}

export function Panel({
  title,
  description,
  action,
  children,
  className = '',
}: {
  title?: string;
  description?: string;
  action?: ReactNode;
  children: ReactNode;
  className?: string;
}) {
  return (
    <section className={`rounded-lg border border-[#e5e2dc] bg-white shadow-sm ${className}`}>
      {title || description || action ? (
        <div className="flex flex-col gap-3 border-b border-[#e5e2dc] px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            {title ? <h2 className="text-base font-semibold text-[#1f2937]">{title}</h2> : null}
            {description ? <p className="mt-0.5 text-sm text-[#7c8591]">{description}</p> : null}
          </div>
          {action}
        </div>
      ) : null}
      {children}
    </section>
  );
}

export function SelectField({
  value,
  onChange,
  children,
  ariaLabel,
}: {
  value: string;
  onChange: (value: string) => void;
  children: ReactNode;
  ariaLabel?: string;
}) {
  return (
    <select
      aria-label={ariaLabel}
      value={value}
      onChange={(event) => onChange(event.target.value)}
      className="h-9 rounded-md border border-[#dcd8d1] bg-white px-3 text-sm text-[#4b5563] outline-none transition focus:border-[#2490ef] focus:ring-2 focus:ring-[#2490ef]/10"
    >
      {children}
    </select>
  );
}

export function SearchField({
  value,
  onChange,
  placeholder = 'Search...',
}: {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}) {
  return (
    <div className="relative min-w-0 flex-1 sm:min-w-[240px]">
      <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#9aa1aa]" />
      <input
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        className="h-9 w-full rounded-md border border-[#dcd8d1] bg-white pl-9 pr-9 text-sm text-[#1f2937] outline-none transition focus:border-[#2490ef] focus:ring-2 focus:ring-[#2490ef]/10"
      />
      {value ? (
        <button
          type="button"
          aria-label="Clear search"
          onClick={() => onChange('')}
          className="absolute right-2 top-1/2 -translate-y-1/2 rounded p-1 text-[#9aa1aa] hover:bg-[#eef3f5] hover:text-[#4b5563]"
        >
          <X className="h-3.5 w-3.5" />
        </button>
      ) : null}
    </div>
  );
}

export function ExportButton({
  rows,
  filename,
}: {
  rows: Record<string, string | number>[];
  filename: string;
}) {
  return (
    <button
      type="button"
      onClick={() => downloadCsv(filename, rows)}
      className="inline-flex h-9 items-center justify-center gap-2 rounded-md border border-[#dcd8d1] bg-white px-3 text-sm font-medium text-[#4b5563] transition hover:bg-[#f7f8f9]"
    >
      <Download className="h-4 w-4" />
      Export CSV
    </button>
  );
}

export function Badge({ children, tone = 'blue' }: { children: ReactNode; tone?: Tone }) {
  const tones: Record<Tone, string> = {
    blue: 'border-[#d7e8f8] bg-[#eef6ff] text-[#1674c4]',
    green: 'border-emerald-200 bg-emerald-50 text-emerald-700',
    amber: 'border-amber-200 bg-amber-50 text-amber-700',
    red: 'border-red-200 bg-red-50 text-red-700',
    gray: 'border-gray-200 bg-gray-50 text-gray-600',
    violet: 'border-violet-200 bg-violet-50 text-violet-700',
  };
  return <span className={`inline-flex rounded-full border px-2 py-0.5 text-xs font-medium ${tones[tone]}`}>{children}</span>;
}

export function ProgressBar({
  label,
  value,
  right,
}: {
  label: string;
  value: number;
  right?: string;
}) {
  return (
    <div>
      <div className="mb-1.5 flex items-center justify-between gap-4 text-sm">
        <span className="text-[#4b5563]">{label}</span>
        <span className="text-[#7c8591]">{right ?? `${value}%`}</span>
      </div>
      <div className="h-2 overflow-hidden rounded-full bg-[#edf0f2]">
        <div className="h-full rounded-full bg-[#2490ef]" style={{ width: `${Math.max(0, Math.min(100, value))}%` }} />
      </div>
    </div>
  );
}

export function TrendBars({ values, labels }: { values: number[]; labels?: string[] }) {
  return (
    <div className="flex h-64 items-end gap-2 rounded-lg bg-[#fbfaf8] p-4">
      {values.map((value, index) => (
        <div key={`${value}-${index}`} className="group flex min-w-0 flex-1 flex-col justify-end gap-1">
          <div
            title={`${labels?.[index] ?? index + 1}: ${value}`}
            className="rounded-t bg-[#2490ef]/80 transition group-hover:bg-[#2490ef]"
            style={{ height: `${Math.max(4, Math.min(100, value))}%` }}
          />
          {labels ? <span className="truncate text-center text-[10px] text-[#8a929d]">{labels[index]}</span> : null}
        </div>
      ))}
    </div>
  );
}

export function EmptyState({ message }: { message: string }) {
  return <div className="px-5 py-12 text-center text-sm text-[#7c8591]">{message}</div>;
}

export function DataTable<T>({
  columns,
  rows,
  rowKey,
}: {
  columns: { label: string; render: (row: T) => ReactNode; className?: string }[];
  rows: T[];
  rowKey: (row: T) => string;
}) {
  if (!rows.length) return <EmptyState message="No records match the selected filters." />;
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-left">
        <thead className="bg-[#fbfaf8]">
          <tr>
            {columns.map((column) => (
              <th key={column.label} className={`whitespace-nowrap px-5 py-3 text-xs font-medium uppercase tracking-wide text-[#7c8591] ${column.className ?? ''}`}>
                {column.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={rowKey(row)} className="border-t border-[#f0eee9] hover:bg-[#fcfbfa]">
              {columns.map((column) => (
                <td key={column.label} className={`whitespace-nowrap px-5 py-3.5 text-sm text-[#4b5563] ${column.className ?? ''}`}>
                  {column.render(row)}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export function downloadCsv(filename: string, rows: Record<string, string | number>[]) {
  if (!rows.length) return;
  const headers = Object.keys(rows[0]);
  const escape = (value: string | number) => `"${String(value).replace(/"/g, '""')}"`;
  const csv = [headers.map(escape).join(','), ...rows.map((row) => headers.map((header) => escape(row[header])).join(','))].join('\n');
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = filename.endsWith('.csv') ? filename : `${filename}.csv`;
  anchor.click();
  URL.revokeObjectURL(url);
}

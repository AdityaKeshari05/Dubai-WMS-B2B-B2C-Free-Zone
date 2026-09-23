import React from 'react';
import { Card as UICard, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input as UIInput } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { PageHeader as SharedPageHeader } from '@/components/shared/PageHeader';
import { StatsCard } from '@/components/shared/StatsCard';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Search, X, Boxes } from 'lucide-react';

export const Badge = ({ tone, children, ...props }: any) => {
  const colorClass = 
    tone === 'green' ? 'bg-green-100 text-green-700 border-green-200' :
    tone === 'red' ? 'bg-red-100 text-red-700 border-red-200' :
    tone === 'blue' ? 'bg-blue-100 text-blue-700 border-blue-200' :
    tone === 'amber' ? 'bg-amber-100 text-amber-700 border-amber-200' :
    'bg-gray-100 text-gray-600 border-gray-200';
  return (
    <span className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium ${colorClass}`} {...props}>
      {children}
    </span>
  );
};

export const Card = ({ action, title, description, children, ...props }: any) => (
  <UICard className="w-full shadow-sm border-[#e5e2dc] bg-white" {...props}>
    {(title || description || action) && (
      <CardHeader className="flex flex-col gap-4 pb-2 sm:flex-row sm:items-center sm:justify-between sm:space-y-0">
        <div className="space-y-1">
          {title && <CardTitle className="text-lg font-semibold text-[#1f2937]">{title}</CardTitle>}
          {description && <CardDescription className="text-sm text-[#6b7280]">{description}</CardDescription>}
        </div>
        {action && <div>{action}</div>}
      </CardHeader>
    )}
    <CardContent>{children}</CardContent>
  </UICard>
);

export const Field = ({ label, children, ...props }: any) => (
  <div className="space-y-1.5" {...props}>
    <Label className="text-sm font-medium text-[#374151]">{label}</Label>
    {children}
  </div>
);

export const Input = ({ onChange, ...props }: any) => (
  <UIInput onChange={e => onChange?.(e.target.value)} {...props} />
);

export const SearchInput = ({ onChange, ...props }: any) => (
  <div className="relative">
    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-[#6b7280]" />
    <UIInput type="search" className="pl-9 bg-white" onChange={e => onChange?.(e.target.value)} {...props} />
  </div>
);

export const Select = ({ onChange, ...props }: any) => (
  <select 
    className="flex h-9 w-full rounded-md border border-input bg-white px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
    onChange={e => onChange?.(e.target.value)}
    {...props} 
  />
);

export const Modal = ({ open, title, onClose, footer, children, ...props }: any) => (
  <Dialog open={open} onOpenChange={(val) => !val && onClose?.()}>
    <DialogContent className="sm:max-w-md">
      <DialogHeader>
        <DialogTitle>{title}</DialogTitle>
      </DialogHeader>
      <div className="py-4">{children}</div>
      {footer && <DialogFooter>{footer}</DialogFooter>}
    </DialogContent>
  </Dialog>
);

export const PageHeader = ({ title, description, icon: Icon, action, ...props }: any) => (
  <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between" {...props}>
    <div>
      <h1 className="text-xl font-semibold leading-7 text-[#1f2937]">{title}</h1>
      {description && <p className="mt-0.5 text-sm text-[#6b7280]">{description}</p>}
    </div>
    <div className="flex flex-wrap items-center gap-2">
      {action}
    </div>
  </div>
);

export const PrimaryButton = (props: any) => <Button variant="default" className="bg-[#2490ef] hover:bg-[#1674c4] text-white" {...props} />;

export const SecondaryButton = (props: any) => <Button variant="outline" className="border-[#e5e2dc] bg-white text-[#374151] hover:bg-[#f8faf9]" {...props} />;

export const StatCard = ({ label, value, hint, icon: Icon, ...props }: any) => (
  <StatsCard title={label} value={value} subtitle={hint} icon={Icon || Boxes} iconColor="text-[#2490ef]" iconBg="bg-[#eef6fd]" {...props} />
);

export const Table = ({ headers, rows, ...props }: any) => (
  <div className="overflow-x-auto rounded-md border border-[#e5e2dc] bg-white shadow-[0_1px_2px_rgba(16,24,40,0.04)] mt-4">
    <table className="w-full text-sm" {...props}>
      <thead className="border-b border-[#e5e2dc] bg-[#f8faf9]">
        <tr>
          {headers?.map((h: any, i: number) => (
            <th key={i} className="px-4 py-3 text-left text-xs font-semibold uppercase text-[#6b7280] whitespace-nowrap">{h}</th>
          ))}
        </tr>
      </thead>
      <tbody className="divide-y divide-[#f0ede8] bg-white">
        {rows?.map((row: any, i: number) => (
          <tr key={i} className="transition-colors hover:bg-[#f8faf9]">
            {row.map((cell: any, j: number) => (
              <td key={j} className="px-4 py-3 text-[#374151]">{cell}</td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  </div>
);

export const Toast = ({ message, onClose, ...props }: any) => {
  React.useEffect(() => {
    const timer = setTimeout(() => onClose?.(), 3000);
    return () => clearTimeout(timer);
  }, [onClose]);
  
  return (
    <div className="fixed bottom-4 right-4 z-50 flex items-center justify-between gap-4 rounded-md bg-gray-900 px-4 py-3 text-sm text-white shadow-lg animate-in slide-in-from-bottom-5" {...props}>
      <span>{message}</span>
      <button onClick={onClose} className="text-gray-400 hover:text-white"><X className="h-4 w-4" /></button>
    </div>
  );
};

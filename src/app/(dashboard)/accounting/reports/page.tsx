'use client';

import { useState } from 'react';
import { BarChart2, Download } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { LoadingSpinner } from '@/components/shared/LoadingSpinner';
import api from '@/lib/api';
import { formatCurrency } from '@/lib/utils';
import toast from 'react-hot-toast';

interface TrialBalanceLine { accountCode: string; accountName: string; accountType: string; debit: number; credit: number; }

export default function AccountingReportsPage() {
  const [trialBalance, setTrialBalance] = useState<TrialBalanceLine[]>([]);
  const [isLoadingTB, setIsLoadingTB] = useState(false);
  const [tbDate, setTbDate] = useState(new Date().toISOString().split('T')[0]);

  const fetchTrialBalance = async () => {
    setIsLoadingTB(true);
    try {
      const res = await api.get('/accounting/trial-balance', { params: { asOf: tbDate } });
      setTrialBalance(res.data.data);
    } catch { toast.error('Failed to fetch trial balance'); }
    finally { setIsLoadingTB(false); }
  };

  const totalDebits = trialBalance.reduce((s, l) => s + l.debit, 0);
  const totalCredits = trialBalance.reduce((s, l) => s + l.credit, 0);

  const groupByType = (type: string) => trialBalance.filter(l => l.accountType === type);

  return (
    <div>
      <div className="flex items-center gap-3 mb-6">
        <BarChart2 className="h-6 w-6 text-blue-600" />
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Accounting Reports</h1>
          <p className="text-sm text-gray-500">Financial statements and reports</p>
        </div>
      </div>

      <Tabs defaultValue="trial-balance">
        <TabsList className="mb-4">
          <TabsTrigger value="trial-balance">Trial Balance</TabsTrigger>
          <TabsTrigger value="balance-sheet">Balance Sheet</TabsTrigger>
        </TabsList>

        <TabsContent value="trial-balance">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Trial Balance</CardTitle>
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-2">
                    <Label className="text-sm">As of</Label>
                    <Input type="date" value={tbDate} onChange={e => setTbDate(e.target.value)} className="w-40 h-8" />
                  </div>
                  <Button onClick={fetchTrialBalance} disabled={isLoadingTB} size="sm">
                    {isLoadingTB ? 'Loading...' : 'Generate'}
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {isLoadingTB ? (
                <div className="flex justify-center py-12"><LoadingSpinner /></div>
              ) : trialBalance.length === 0 ? (
                <div className="text-center py-12 text-gray-500">
                  <BarChart2 className="h-10 w-10 mx-auto mb-2 opacity-30" />
                  <p>Click Generate to view the trial balance</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b-2 border-gray-200">
                        <th className="text-left py-2 px-3">Code</th>
                        <th className="text-left py-2 px-3">Account Name</th>
                        <th className="text-left py-2 px-3">Type</th>
                        <th className="text-right py-2 px-3">Debit</th>
                        <th className="text-right py-2 px-3">Credit</th>
                      </tr>
                    </thead>
                    <tbody>
                      {['ASSET','LIABILITY','EQUITY','REVENUE','EXPENSE'].map(type => {
                        const lines = groupByType(type);
                        if (!lines.length) return null;
                        return (
                          <>
                            <tr key={`header-${type}`} className="bg-gray-50">
                              <td colSpan={5} className="py-1.5 px-3 font-semibold text-gray-600 text-xs uppercase tracking-wider">{type}</td>
                            </tr>
                            {lines.map((l, i) => (
                              <tr key={i} className="border-b border-gray-100 hover:bg-gray-50">
                                <td className="py-2 px-3 font-mono text-gray-500">{l.accountCode}</td>
                                <td className="py-2 px-3">{l.accountName}</td>
                                <td className="py-2 px-3 text-gray-500">{l.accountType}</td>
                                <td className="py-2 px-3 text-right">{l.debit > 0 ? formatCurrency(l.debit) : '—'}</td>
                                <td className="py-2 px-3 text-right">{l.credit > 0 ? formatCurrency(l.credit) : '—'}</td>
                              </tr>
                            ))}
                          </>
                        );
                      })}
                    </tbody>
                    <tfoot>
                      <tr className="border-t-2 border-gray-900 font-bold">
                        <td colSpan={3} className="py-3 px-3">Total</td>
                        <td className="py-3 px-3 text-right">{formatCurrency(totalDebits)}</td>
                        <td className={`py-3 px-3 text-right ${Math.abs(totalDebits - totalCredits) < 0.01 ? 'text-green-700' : 'text-red-600'}`}>
                          {formatCurrency(totalCredits)}
                        </td>
                      </tr>
                      {Math.abs(totalDebits - totalCredits) > 0.01 && (
                        <tr><td colSpan={5} className="px-3 py-1 text-red-600 text-xs">Warning: Trial balance is not balanced (difference: {formatCurrency(Math.abs(totalDebits - totalCredits))})</td></tr>
                      )}
                    </tfoot>
                  </table>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="balance-sheet">
          <Card>
            <CardHeader><CardTitle>Balance Sheet</CardTitle></CardHeader>
            <CardContent>
              {trialBalance.length === 0 ? (
                <div className="text-center py-12 text-gray-500">
                  <p>Generate a trial balance first to see the balance sheet</p>
                  <Button variant="outline" className="mt-3" onClick={() => fetchTrialBalance()}>Generate Trial Balance</Button>
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-8">
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-3 text-lg">Assets</h3>
                    {groupByType('ASSET').map((l, i) => (
                      <div key={i} className="flex justify-between py-1.5 border-b border-gray-100 text-sm">
                        <span>{l.accountName}</span>
                        <span className="font-medium">{formatCurrency(l.debit - l.credit)}</span>
                      </div>
                    ))}
                    <div className="flex justify-between py-2 font-bold mt-1">
                      <span>Total Assets</span>
                      <span>{formatCurrency(groupByType('ASSET').reduce((s, l) => s + (l.debit - l.credit), 0))}</span>
                    </div>
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-3 text-lg">Liabilities & Equity</h3>
                    {[...groupByType('LIABILITY'), ...groupByType('EQUITY')].map((l, i) => (
                      <div key={i} className="flex justify-between py-1.5 border-b border-gray-100 text-sm">
                        <span>{l.accountName}</span>
                        <span className="font-medium">{formatCurrency(l.credit - l.debit)}</span>
                      </div>
                    ))}
                    <div className="flex justify-between py-2 font-bold mt-1">
                      <span>Total L &amp; E</span>
                      <span>{formatCurrency([...groupByType('LIABILITY'), ...groupByType('EQUITY')].reduce((s, l) => s + (l.credit - l.debit), 0))}</span>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

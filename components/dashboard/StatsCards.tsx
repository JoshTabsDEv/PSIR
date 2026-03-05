'use client';

import { FileText, FileClock, FileCheck, TrendingUp, TrendingDown, Activity } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import type { MonthlyReportData } from '@/types/psir';

interface StatsCardsProps {
  totalReports: number;
  draftReports: number;
  completedReports: number;
  monthlyData?: MonthlyReportData[];
}

function computeTrend(monthlyData: MonthlyReportData[] | undefined, key: 'total' | 'completed' | 'draft'): { value: number; isPositive: boolean } {
  if (!monthlyData || monthlyData.length < 2) {
    return { value: 0, isPositive: true };
  }
  const current = monthlyData[monthlyData.length - 1][key];
  const previous = monthlyData[monthlyData.length - 2][key];
  if (previous === 0) {
    return { value: current > 0 ? 100 : 0, isPositive: current > 0 };
  }
  const change = Math.round(((current - previous) / previous) * 100);
  return { value: Math.abs(change), isPositive: change >= 0 };
}

export function StatsCards({ totalReports, draftReports, completedReports, monthlyData }: StatsCardsProps) {
  const completionRate = totalReports > 0 ? Math.round((completedReports / totalReports) * 100) : 0;

  const trendTotal = computeTrend(monthlyData, 'total');
  const trendDraft = computeTrend(monthlyData, 'draft');
  const trendCompleted = computeTrend(monthlyData, 'completed');

  const stats = [
    {
      title: 'Total Reports',
      value: totalReports,
      description: 'All investigation files',
      icon: FileText,
      trend: trendTotal,
      color: 'text-[var(--brand-primary)]',
      bgColor: 'bg-[var(--brand-primary)]/10',
      borderColor: 'border-l-[var(--brand-primary)]',
    },
    {
      title: 'Pending Drafts',
      value: draftReports,
      description: 'Awaiting completion',
      icon: FileClock,
      trend: trendDraft,
      color: 'text-orange-600',
      bgColor: 'bg-orange-50',
      borderColor: 'border-l-orange-500',
    },
    {
      title: 'Completed',
      value: completedReports,
      description: 'Finalized reports',
      icon: FileCheck,
      trend: trendCompleted,
      color: 'text-green-600',
      bgColor: 'bg-green-50',
      borderColor: 'border-l-green-600',
    },
    {
      title: 'Completion Rate',
      value: `${completionRate}%`,
      description: 'Overall performance',
      icon: Activity,
      trend: { value: completionRate, isPositive: completionRate >= 50 },
      color: 'text-[var(--color-info)]',
      bgColor: 'bg-blue-50',
      borderColor: 'border-l-blue-600',
    },
  ];

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {stats.map((stat) => (
        <Card
          key={stat.title}
          className={cn(
            'bg-white border shadow-sm transition-all duration-200 hover:shadow-md border-l-4 overflow-hidden',
            stat.borderColor
          )}
        >
          <CardContent className="p-5">
            <div className="flex items-start justify-between">
              <div className="space-y-2">
                <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/70">
                  {stat.title}
                </span>
                <div className="text-3xl font-bold tracking-tight text-foreground">
                  {stat.value}
                </div>
                <p className="text-[11px] text-muted-foreground">{stat.description}</p>
              </div>
              <div className={cn('rounded-lg p-2.5', stat.bgColor)}>
                <stat.icon className={cn('h-4.5 w-4.5', stat.color)} />
              </div>
            </div>
            {/* Trend indicator */}
            {stat.trend.value > 0 && (
              <div className="mt-3 pt-3 border-t border-dashed flex items-center gap-1.5">
                {stat.trend.isPositive ? (
                  <TrendingUp className="h-3 w-3 text-green-600" />
                ) : (
                  <TrendingDown className="h-3 w-3 text-orange-600" />
                )}
                <span
                  className={cn(
                    'text-[10px] font-bold',
                    stat.trend.isPositive ? 'text-green-600' : 'text-orange-600'
                  )}
                >
                  {stat.trend.isPositive ? '+' : '-'}
                  {stat.trend.value}%
                </span>
                <span className="text-[10px] text-muted-foreground">vs last month</span>
              </div>
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

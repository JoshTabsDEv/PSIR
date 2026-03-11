'use client';

import { FileText, FileClock, FileCheck, TrendingUp, TrendingDown, Activity } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { CountUp } from '@/components/ui/count-up';
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
      iconColor: 'text-[var(--brand-primary)]',
      iconBg: 'bg-[var(--brand-primary)]/10',
    },
    {
      title: 'Pending Drafts',
      value: draftReports,
      description: 'Awaiting completion',
      icon: FileClock,
      trend: trendDraft,
      iconColor: 'text-[var(--color-warning)]',
      iconBg: 'bg-[var(--color-warning)]/10',
    },
    {
      title: 'Completed',
      value: completedReports,
      description: 'Finalized reports',
      icon: FileCheck,
      trend: trendCompleted,
      iconColor: 'text-[var(--color-success)]',
      iconBg: 'bg-[var(--color-success)]/10',
    },
    {
      title: 'Completion Rate',
      value: completionRate,
      description: 'Overall performance',
      icon: Activity,
      trend: { value: completionRate, isPositive: completionRate >= 50 },
      iconColor: 'text-[var(--color-info)]',
      iconBg: 'bg-[var(--color-info)]/10',
      isRate: true,
      rateValue: completionRate,
    },
  ];

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {stats.map((stat) => (
        <Card
          key={stat.title}
          className="bg-card border border-border rounded-xl shadow-sm hover:shadow-md transition-shadow overflow-hidden"
        >
          <CardContent className="p-6">
            {/* Top row: label + icon */}
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                {stat.title}
              </span>
              <div className={cn('rounded-full p-2', stat.iconBg)}>
                <stat.icon className={cn('h-4 w-4', stat.iconColor)} />
              </div>
            </div>

            {/* Metric */}
            <div className="text-3xl font-semibold tracking-tight text-foreground">
              {typeof stat.value === 'number' ? (
                'isRate' in stat && stat.isRate ? (
                  <CountUp 
                    end={stat.value} 
                    duration={1500} 
                    delay={100}
                    suffix="%"
                    className="inline-block"
                  />
                ) : (
                  <CountUp 
                    end={stat.value} 
                    duration={1500} 
                    delay={100}
                    className="inline-block"
                  />
                )
              ) : (
                stat.value
              )}
            </div>
            <p className="text-xs text-muted-foreground mt-1">{stat.description}</p>

            {/* Progress bar for completion rate */}
            {'isRate' in stat && stat.isRate && (
              <div className="mt-4">
                <div className="h-1.5 w-full rounded-full bg-muted">
                  <div
                    className="h-1.5 rounded-full bg-[var(--color-info)] transition-all duration-500"
                    style={{ width: `${stat.rateValue}%` }}
                  />
                </div>
              </div>
            )}

            {/* Trend pill */}
            {stat.trend.value > 0 && !('isRate' in stat && stat.isRate) && (
              <div className="mt-4 flex items-center gap-2">
                <span
                  className={cn(
                    'inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium',
                    stat.trend.isPositive
                      ? 'bg-[var(--color-success)]/10 text-[var(--color-success)]'
                      : 'bg-[var(--color-warning)]/10 text-[var(--color-warning)]'
                  )}
                >
                  {stat.trend.isPositive ? (
                    <TrendingUp className="h-3 w-3" />
                  ) : (
                    <TrendingDown className="h-3 w-3" />
                  )}
                  {stat.trend.isPositive ? '+' : '-'}{stat.trend.value}%
                </span>
                <span className="text-xs text-muted-foreground">vs last month</span>
              </div>
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

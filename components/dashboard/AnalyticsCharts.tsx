'use client';

import { useMemo } from 'react';
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { TrendingUp, BarChart3, PieChartIcon } from 'lucide-react';
import type { MonthlyReportData } from '@/types/psir';

interface AnalyticsChartsProps {
  totalReports: number;
  completedReports: number;
  draftReports: number;
  monthlyData?: MonthlyReportData[];
}

const CHART_COLORS = {
  primary: 'var(--brand-primary)',
  success: 'var(--color-success)',
  warning: 'var(--color-warning)',
  info: 'var(--color-info)',
  muted: '#94a3b8',
};

// Fallback monthly data when API data is not yet available
function generateFallbackData(): MonthlyReportData[] {
  const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const now = new Date();
  return Array.from({ length: 12 }, (_, i) => {
    const idx = (now.getMonth() - 11 + i + 12) % 12;
    return {
      month: monthNames[idx],
      total: 0,
      completed: 0,
      draft: 0,
    };
  });
}

function CustomTooltip({ active, payload, label }: { active?: boolean; payload?: Array<{ value: number; name: string; color: string }>; label?: string }) {
  if (!active || !payload?.length) return null;

  return (
    <div className="rounded-lg border bg-white px-3 py-2 shadow-lg">
      <p className="mb-1 text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
        {label}
      </p>
      {payload.map((entry, index) => (
        <div key={index} className="flex items-center gap-2 text-xs">
          <div
            className="h-2 w-2 rounded-full"
            style={{ backgroundColor: entry.color }}
          />
          <span className="text-muted-foreground">{entry.name}:</span>
          <span className="font-semibold text-foreground">{entry.value}</span>
        </div>
      ))}
    </div>
  );
}

export function AnalyticsCharts({
  totalReports,
  completedReports,
  draftReports,
  monthlyData,
}: AnalyticsChartsProps) {
  const chartData = useMemo(() => monthlyData ?? generateFallbackData(), [monthlyData]);

  const statusData = useMemo(() => [
    { name: 'Completed', value: completedReports, color: CHART_COLORS.success },
    { name: 'Draft', value: draftReports, color: CHART_COLORS.warning },
  ], [completedReports, draftReports]);

  const completionRateData = useMemo(() => {
    return chartData.map((item) => ({
      ...item,
      rate: item.total > 0 ? Math.round((item.completed / item.total) * 100) : 0,
    }));
  }, [chartData]);

  const completionPercent = totalReports > 0 ? Math.round((completedReports / totalReports) * 100) : 0;

  return (
    <div className="grid gap-6 lg:grid-cols-3">
      {/* Area Chart: Reports Over Time */}
      <Card className="shadow-sm bg-white lg:col-span-2">
        <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
          <div className="space-y-1">
            <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
              Case Volume
            </span>
            <CardTitle className="text-sm font-bold text-foreground flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-[var(--brand-primary)]" />
              Reports Created Over Time
            </CardTitle>
          </div>
          <span className="text-[10px] font-medium text-muted-foreground">Last 12 months</span>
        </CardHeader>
        <CardContent>
          <div className="h-[240px] w-full mt-2">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="gradientTotal" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor={CHART_COLORS.primary} stopOpacity={0.2} />
                    <stop offset="95%" stopColor={CHART_COLORS.primary} stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="gradientCompleted" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor={CHART_COLORS.success} stopOpacity={0.2} />
                    <stop offset="95%" stopColor={CHART_COLORS.success} stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" vertical={false} />
                <XAxis
                  dataKey="month"
                  tick={{ fontSize: 10, fill: '#94a3b8' }}
                  tickLine={false}
                  axisLine={false}
                />
                <YAxis
                  tick={{ fontSize: 10, fill: '#94a3b8' }}
                  tickLine={false}
                  axisLine={false}
                  allowDecimals={false}
                />
                <Tooltip content={<CustomTooltip />} />
                <Area
                  type="monotone"
                  dataKey="total"
                  name="Total"
                  stroke={CHART_COLORS.primary}
                  strokeWidth={2}
                  fill="url(#gradientTotal)"
                  dot={false}
                  activeDot={{ r: 4, strokeWidth: 2, fill: '#fff' }}
                />
                <Area
                  type="monotone"
                  dataKey="completed"
                  name="Completed"
                  stroke={CHART_COLORS.success}
                  strokeWidth={2}
                  fill="url(#gradientCompleted)"
                  dot={false}
                  activeDot={{ r: 4, strokeWidth: 2, fill: '#fff' }}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* Donut Chart: Status Breakdown */}
      <Card className="shadow-sm bg-white">
        <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
          <div className="space-y-1">
            <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
              Distribution
            </span>
            <CardTitle className="text-sm font-bold text-foreground flex items-center gap-2">
              <PieChartIcon className="h-4 w-4 text-[var(--brand-primary)]" />
              Status Breakdown
            </CardTitle>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="h-[160px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={statusData}
                  cx="50%"
                  cy="45%"
                  innerRadius={45}
                  outerRadius={70}
                  paddingAngle={3}
                  dataKey="value"
                  strokeWidth={0}
                >
                  {statusData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
              </PieChart>
            </ResponsiveContainer>
          </div>
          {/* Center label overlay */}
          <div className="flex flex-col items-center -mt-[120@px] mb-4 pointer-events-none">
            <span className="text-xl font-bold mg-12 text-foreground">{completionPercent}%</span>
            <span className="text-[9px] text-muted-foreground uppercase tracking-wider font-medium">Completed</span>
          </div>
          {/* Legend */}
          <div className="flex flex-col gap-3 pt-3 border-t border-border/50">
            {statusData.map((entry) => (
              <div key={entry.name} className="flex items-center justify-between px-1">
                <div className="flex items-center gap-2.5 flex-1 min-w-0">
                  <div
                    className="h-3 w-3 rounded-full flex-shrink-0"
                    style={{ backgroundColor: entry.color }}
                  />
                  <span className="text-xs font-medium text-foreground truncate">{entry.name}</span>
                </div>
                <span className="text-xs font-bold text-foreground ml-2 flex-shrink-0">{entry.value}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Bar Chart: Monthly Completion Rate */}
      <Card className="shadow-sm bg-white lg:col-span-3">
        <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
          <div className="space-y-1">
            <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
              Performance
            </span>
            <CardTitle className="text-sm font-bold text-foreground flex items-center gap-2">
              <BarChart3 className="h-4 w-4 text-[var(--brand-primary)]" />
              Monthly Completion Rate
            </CardTitle>
          </div>
          <span className="text-[10px] font-medium text-muted-foreground">Last 12 months</span>
        </CardHeader>
        <CardContent>
          <div className="h-[200px] w-full mt-2">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={completionRateData} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" vertical={false} />
                <XAxis
                  dataKey="month"
                  tick={{ fontSize: 10, fill: '#94a3b8' }}
                  tickLine={false}
                  axisLine={false}
                />
                <YAxis
                  tick={{ fontSize: 10, fill: '#94a3b8' }}
                  tickLine={false}
                  axisLine={false}
                  domain={[0, 100]}
                  unit="%"
                />
                <Tooltip
                  content={({ active, payload, label }) => {
                    if (!active || !payload?.length) return null;
                    const data = payload[0].payload;
                    return (
                      <div className="rounded-lg border bg-white px-3 py-2 shadow-lg">
                        <p className="mb-1 text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                          {label}
                        </p>
                        <div className="text-xs space-y-1">
                          <div className="flex items-center gap-2">
                            <span className="text-muted-foreground">Rate:</span>
                            <span className="font-semibold">{data.rate}%</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="text-muted-foreground">Completed:</span>
                            <span className="font-semibold">{data.completed} / {data.total}</span>
                          </div>
                        </div>
                      </div>
                    );
                  }}
                />
                <Bar
                  dataKey="rate"
                  name="Completion Rate"
                  fill={CHART_COLORS.info}
                  radius={[4, 4, 0, 0]}
                  maxBarSize={40}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

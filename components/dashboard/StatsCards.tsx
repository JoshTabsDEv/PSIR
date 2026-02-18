'use client';

import { FileText, FileClock, FileCheck, TrendingUp, TrendingDown } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface StatsCardsProps {
  totalReports: number;
  draftReports: number;
  completedReports: number;
}

export function StatsCards({ totalReports, draftReports, completedReports }: StatsCardsProps) {
  const stats = [
    {
      title: 'Total Reports',
      value: totalReports,
      icon: FileText,
      color: 'text-[var(--brand-primary)]',
      bgColor: 'bg-[#fef2f4]',
      trend: { value: 12, isPositive: true },
    },
    {
      title: 'Draft Reports',
      value: draftReports,
      icon: FileClock,
      color: 'text-orange-600',
      bgColor: 'bg-orange-50',
      trend: { value: 5, isPositive: false },
    },
    {
      title: 'Completed Reports',
      value: completedReports,
      icon: FileCheck,
      color: 'text-green-600',
      bgColor: 'bg-green-50',
      trend: { value: 18, isPositive: true },
    },
    {
      title: 'This Month',
      value: totalReports,
      icon: TrendingUp,
      color: 'text-purple-600',
      bgColor: 'bg-purple-50',
      trend: { value: 23, isPositive: true },
    },
  ];

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {stats.map((stat) => (
        <Card
          key={stat.title}
          className="transition-all duration-200 hover:scale-[1.02] hover:shadow-lg cursor-pointer"
        >
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">
              {stat.title}
            </CardTitle>
            <div className={`rounded-lg p-2 ${stat.bgColor}`}>
              <stat.icon className={`h-4 w-4 ${stat.color}`} />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stat.value}</div>
            <div className="flex items-center gap-1 text-xs mt-1">
              {stat.trend.isPositive ? (
                <TrendingUp className="h-3 w-3 text-green-600" />
              ) : (
                <TrendingDown className="h-3 w-3 text-red-600" />
              )}
              <span className={stat.trend.isPositive ? 'text-green-600 font-medium' : 'text-red-600 font-medium'}>
                {stat.trend.isPositive ? '+' : '-'}{stat.trend.value}%
              </span>
              <span className="text-gray-500">from last month</span>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}


'use client';

import { FileText, FileClock, FileCheck, TrendingUp } from 'lucide-react';
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
    },
    {
      title: 'Draft Reports',
      value: draftReports,
      icon: FileClock,
      color: 'text-orange-600',
      bgColor: 'bg-orange-50',
    },
    {
      title: 'Completed Reports',
      value: completedReports,
      icon: FileCheck,
      color: 'text-green-600',
      bgColor: 'bg-green-50',
    },
    {
      title: 'This Month',
      value: totalReports,
      icon: TrendingUp,
      color: 'text-purple-600',
      bgColor: 'bg-purple-50',
    },
  ];

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {stats.map((stat) => (
        <Card key={stat.title}>
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
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

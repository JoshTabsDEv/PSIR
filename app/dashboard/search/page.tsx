'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Search as SearchIcon, Loader2, SearchX } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Breadcrumb } from '@/components/ui/breadcrumb';
import { EmptyState } from '@/components/dashboard/EmptyState';
import { Skeleton } from '@/components/ui/skeleton';
import type { PSIRReport } from '@/types/psir';
import { formatDateDisplay } from '@/lib/utils/date-formatters';
import { formatFullName } from '@/lib/utils/form-helpers';

export default function SearchPage() {
  const [query, setQuery] = useState('');
  const [status, setStatus] = useState('all');
  const [results, setResults] = useState<PSIRReport[]>([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);

  const handleSearch = async () => {
    if (!query.trim() && status === 'all') {
      return;
    }

    setLoading(true);
    setSearched(true);

    try {
      const params = new URLSearchParams();
      if (query) params.set('q', query);
      if (status !== 'all') params.set('status', status);

      const response = await fetch(`/api/search?${params}`);
      const result = await response.json();

      if (result.success) {
        setResults(result.data);
      }
    } catch (error) {
      console.error('Search failed:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  return (
    <div className="space-y-6">
      <Breadcrumb
        items={[
          { label: 'Dashboard', href: '/dashboard' },
          { label: 'Search' },
        ]}
      />

      <div>
        <h1 className="text-2xl font-bold">Search Reports</h1>
        <p className="text-gray-500">
          Search by name, case number, or report number
        </p>
      </div>

      {/* Search Form */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col gap-4 sm:flex-row">
            <div className="relative flex-1">
              <SearchIcon className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
              <Input
                type="text"
                placeholder="Search reports..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={handleKeyPress}
                className="pl-10"
              />
            </div>
            <Select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className="sm:w-36"
            >
              <option value="all">All Status</option>
              <option value="draft">Draft</option>
              <option value="completed">Completed</option>
            </Select>
            <Button onClick={handleSearch} disabled={loading}>
              {loading ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <SearchIcon className="mr-2 h-4 w-4" />
              )}
              Search
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Search Results */}
      {/* Loading skeleton */}
      {loading && searched && (
        <Card>
          <CardContent className="p-0">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="flex items-center justify-between gap-4 border-b px-6 py-4 last:border-0">
                <div className="space-y-2 flex-1">
                  <div className="flex items-center gap-2">
                    <Skeleton className="h-4 w-32" />
                    <Skeleton className="h-5 w-16 rounded-full" />
                  </div>
                  <Skeleton className="h-4 w-48" />
                  <Skeleton className="h-3.5 w-64" />
                </div>
                <Skeleton className="h-4 w-24 shrink-0" />
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {searched && !loading && (
        <div>
          <h2 className="text-lg font-semibold mb-4">
            {results.length} result{results.length !== 1 ? 's' : ''} found
          </h2>

          {results.length === 0 ? (
            <Card>
              <CardContent>
                <EmptyState
                  icon={SearchX}
                  title="No results found"
                  description="No reports match your search. Try different keywords or clear the filters."
                  action={{ label: 'Create New Report', href: '/dashboard/reports/new' }}
                  secondaryAction={{ label: 'View all reports', href: '/dashboard/reports' }}
                />
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {results.map((report) => (
                <Link key={report._id} href={`/dashboard/reports/${report._id}`}>
                  <Card className="hover:border-[var(--brand-primary)] transition-colors cursor-pointer">
                    <CardContent className="py-4">
                      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-mono text-sm text-[var(--brand-primary)]">
                              {report.reportNumber}
                            </span>
                            <Badge variant={report.status === 'completed' ? 'success' : 'warning'}>
                              {report.status}
                            </Badge>
                          </div>
                          <p className="font-semibold mt-1">
                            {formatFullName(
                              report.identifyingData.lastName,
                              report.identifyingData.firstName,
                              report.identifyingData.middleName
                            )}
                          </p>
                          {report.criminalHistory?.presentOffense?.chargedWith && (
                            <p className="text-sm text-gray-500">
                              Charged with: {report.criminalHistory.presentOffense.chargedWith}
                            </p>
                          )}
                        </div>
                        <div className="text-sm text-gray-500">
                          {formatDateDisplay(report.createdAt)}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Search Tips */}
      {!searched && (
        <Card>
          <CardContent className="py-8">
            <h3 className="font-semibold mb-4">Search Tips</h3>
            <ul className="text-sm text-gray-600 space-y-2">
              <li>• Search by offender&apos;s last name or first name</li>
              <li>• Search by case number (e.g., &quot;Crim. Case No. 12345&quot;)</li>
              <li>• Search by report number (e.g., &quot;PSIR-2025-&quot;)</li>
              <li>• Filter by draft or completed status</li>
            </ul>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

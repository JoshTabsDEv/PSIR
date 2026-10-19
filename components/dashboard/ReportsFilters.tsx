'use client';

import { Search, Filter } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { Button } from '@/components/ui/button';

interface ReportsFiltersProps {
  search: string;
  onSearchChange: (value: string) => void;
  status: string;
  onStatusChange: (value: string) => void;
  onSearch: () => void;
}

export function ReportsFilters({
  search,
  onSearchChange,
  status,
  onStatusChange,
  onSearch,
}: ReportsFiltersProps) {
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      onSearch();
    }
  };

  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
      <div className="relative flex-1">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
        <Input
          type="text"
          placeholder="Search by name, case number, or report number..."
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          onKeyDown={handleKeyPress}
          className="pl-10 text-gray-900"
        />
      </div>

      <div className="flex gap-2 text-gray-900">
        <Select
          value={status}
          onChange={(e) => onStatusChange(e.target.value)}
          className="w-36"
        >
          <option value="all">All Status</option>
          <option value="draft">Draft</option>
          <option value="completed">Completed</option>
        </Select>

        <Button onClick={onSearch} className="bg-[var(--brand-primary)] hover:bg-[var(--brand-primary)]/90 text-white">
          <Filter className="mr-2 h-4 w-4" />
          Filter
        </Button>
      </div>
    </div>
  );
}

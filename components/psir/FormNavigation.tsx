'use client';

import { Check } from 'lucide-react';
import { cn } from '@/lib/utils';

interface FormNavigationProps {
  currentSection: number;
  onSectionChange: (section: number) => void;
  onValidateSection?: (fromSection: number, toSection: number) => Promise<boolean>;
  completedSections?: number[];
}

const sections = [
  { id: 1, title: 'Identifying Data', shortTitle: 'I' },
  { id: 2, title: 'Criminal History', shortTitle: 'II' },
  { id: 3, title: 'Socio-Economic Background', shortTitle: 'III' },
  { id: 4, title: 'Analysis & Evaluation', shortTitle: 'IV' },
];

export function FormNavigation({
  currentSection,
  onSectionChange,
  onValidateSection,
  completedSections = [],
}: FormNavigationProps) {
  const handleSectionClick = async (targetSection: number) => {
    // If going backwards or staying on same section, allow without validation
    if (targetSection <= currentSection) {
      onSectionChange(targetSection);
      return;
    }

    // If going forward, validate all sections in between
    if (onValidateSection) {
      // Validate each section from current to target-1
      for (let section = currentSection; section < targetSection; section++) {
        const isValid = await onValidateSection(section, targetSection);
        if (!isValid) {
          return; // Stop if any section fails validation
        }
      }
    }

    onSectionChange(targetSection);
  };

  return (
    <nav className="mb-8">
      {/* Desktop navigation */}
      <div className="hidden md:flex items-center justify-between">
        {sections.map((section, index) => {
          const isActive = currentSection === section.id;
          const isCompleted = completedSections.includes(section.id);

          return (
            <div key={section.id} className="flex items-center">
              <button
                onClick={() => handleSectionClick(section.id)}
                className={cn(
                  'flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition-colors',
                  isActive && 'bg-blue-600 text-white',
                  !isActive && isCompleted && 'bg-green-100 text-green-700',
                  !isActive && !isCompleted && 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                )}
              >
                <span
                  className={cn(
                    'flex h-6 w-6 items-center justify-center rounded-full text-xs font-bold',
                    isActive && 'bg-white text-blue-600',
                    !isActive && isCompleted && 'bg-green-600 text-white',
                    !isActive && !isCompleted && 'bg-gray-300 text-gray-600'
                  )}
                >
                  {isCompleted && !isActive ? (
                    <Check className="h-3 w-3" />
                  ) : (
                    section.shortTitle
                  )}
                </span>
                <span className="hidden lg:inline">{section.title}</span>
              </button>
              {index < sections.length - 1 && (
                <div
                  className={cn(
                    'mx-2 h-0.5 w-8 lg:w-12',
                    isCompleted ? 'bg-green-300' : 'bg-gray-200'
                  )}
                />
              )}
            </div>
          );
        })}
      </div>

      {/* Mobile navigation */}
      <div className="md:hidden">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-gray-600">
            Section {currentSection} of {sections.length}
          </span>
          <span className="text-sm font-semibold">
            {sections[currentSection - 1].title}
          </span>
        </div>
        <div className="flex gap-1">
          {sections.map((section) => {
            const isActive = currentSection === section.id;
            const isCompleted = completedSections.includes(section.id);

            return (
              <button
                key={section.id}
                onClick={() => handleSectionClick(section.id)}
                className={cn(
                  'h-2 flex-1 rounded-full transition-colors',
                  isActive && 'bg-blue-600',
                  !isActive && isCompleted && 'bg-green-500',
                  !isActive && !isCompleted && 'bg-gray-200'
                )}
              />
            );
          })}
        </div>
      </div>
    </nav>
  );
}

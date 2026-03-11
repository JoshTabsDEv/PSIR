'use client';

import { CheckCircle2, Circle } from 'lucide-react';
import { cn } from '@/lib/utils';

interface FormNavigationProps {
  currentSection: number;
  onSectionChange: (section: number) => void;
  onValidateSection?: (fromSection: number, toSection: number) => Promise<boolean>;
  completedSections?: number[];
  allowNextSectionNavigation?: boolean;
}

const sections = [
  { id: 1, title: 'Identifying Data', shortTitle: 'I', description: 'Personal & Case Info' },
  { id: 2, title: 'Criminal History', shortTitle: 'II', description: 'Offenses & Records' },
  { id: 3, title: 'Socio-Economic', shortTitle: 'III', description: 'Family & Community' },
  { id: 4, title: 'Analysis & Evaluation', shortTitle: 'IV', description: 'Final Assessment' },
];

export function FormNavigation({
  currentSection,
  onSectionChange,
  onValidateSection,
  completedSections = [],
  allowNextSectionNavigation = false,
}: FormNavigationProps) {
  const handleSectionClick = async (targetSection: number) => {
    // Always allow navigation to previous sections
    if (targetSection <= currentSection) {
      onSectionChange(targetSection);
      return;
    }

    // Block all forward navigation - only allow manual save button
    return;
  };

  const handleSectionClickEvent = (e: React.MouseEvent, targetSection: number) => {
    e.preventDefault();
    e.stopPropagation();
    handleSectionClick(targetSection);
  };

  return (
    <nav className="flex flex-col space-y-1">
      {sections.map((section) => {
        const isActive = currentSection === section.id;
        const isCompleted = completedSections.includes(section.id);
        const isNextSection = section.id === currentSection + 1;
        const isFutureSection = section.id > currentSection + 1;
        const canNavigate = section.id <= currentSection || (allowNextSectionNavigation && isNextSection);

        return (
          <button
            key={section.id}
            onClick={(e) => handleSectionClickEvent(e, section.id)}
            disabled={!canNavigate}
            className={cn(
              'group relative flex flex-col items-start px-4 py-3 text-left transition-all duration-200 rounded-lg',
              isActive 
                ? 'bg-white shadow-sm ring-1 ring-border border-l-4 border-l-[var(--brand-primary)]' 
                : canNavigate
                  ? 'hover:bg-muted/50 border-l-4 border-l-transparent cursor-pointer'
                  : 'opacity-50 border-l-4 border-l-transparent cursor-not-allowed'
            )}
          >
            <div className="flex items-center gap-3 w-full">
              <span className={cn(
                "text-[10px] font-bold tracking-widest uppercase",
                isActive ? "text-[var(--brand-primary)]" : "text-muted-foreground/60"
              )}>
                Section {section.shortTitle}
              </span>
              {isCompleted && !isActive && (
                <CheckCircle2 className="h-3 w-3 text-green-500 ml-auto" />
              )}
            </div>
            
            <span className={cn(
              "text-sm font-semibold tracking-tight transition-colors mt-0.5",
              isActive ? "text-foreground" : "text-muted-foreground group-hover:text-foreground"
            )}>
              {section.title}
            </span>
            
            <span className="text-[10px] text-muted-foreground/70 leading-none mt-1">
              {section.description}
            </span>
          </button>
        );
      })}
    </nav>
  );
}

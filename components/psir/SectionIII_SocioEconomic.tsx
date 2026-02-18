'use client';

import { useFormContext, useController } from 'react-hook-form';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';
import type { PSIRFormData } from '@/types/psir';

const economicStatusOptions = [
  'Poor',
  'Low-income Class (but not poor)',
  'Low middle-income class',
  'Middle middle-income Class',
  'Upper middle-income Class',
  'Upper-income Class (but not rich)',
  'Rich',
] as const;

const satisfactionOptions = ['Very satisfactory', 'Satisfactory', 'Poor'] as const;

interface RadioSectionProps {
  label: string;
  fieldName: string;
  options: readonly string[];
  horizontal?: boolean;
}

function RadioSection({ label, fieldName, options, horizontal = false }: RadioSectionProps) {
  const { control } = useFormContext<PSIRFormData>();
  const { field } = useController({
    name: fieldName as keyof PSIRFormData,
    control,
  });

  const selectedValue = field.value as string ?? '';

  return (
    <div className="border rounded-lg p-4 bg-gray-50/50">
      <h4 className="text-sm font-semibold text-gray-700 mb-4 uppercase tracking-wide">
        {label}
      </h4>
      <RadioGroup
        value={selectedValue}
        onValueChange={field.onChange}
        name={fieldName}
        // Use a grid to ensure uniform width. 
        // md:grid-cols-3 ensures the 'Satisfactory' options align perfectly in a row.
        className={cn(
          horizontal
            ? 'grid grid-cols-1 md:grid-cols-3 lg:max-w-4xl gap-3'
            : 'grid grid-cols-1 gap-2'
        )}
      >
        {options.map((option) => {
          const id = `${fieldName}-${option}`;
          const isSelected = selectedValue === option;
          return (
            <label
              key={option}
              htmlFor={id}
              className={cn(
                'flex items-center gap-3 rounded-lg border-2 px-4 py-2 cursor-pointer transition-all duration-150 min-h-[44px]',
                isSelected
                  ? 'border-red-600 bg-red-50 shadow-sm'
                  : 'border-gray-200 bg-white hover:border-red-200 hover:bg-red-50/20'
              )}
            >
              <RadioGroupItem value={option} id={id} className="sr-only" />

              {/* Custom Radio Indicator to match screenshot */}
              <div className={cn(
                "flex h-4 w-4 shrink-0 items-center justify-center rounded-full border",
                isSelected ? "border-red-600 bg-red-600" : "border-gray-400"
              )}>
                {isSelected && <div className="h-1.5 w-1.5 rounded-full bg-white" />}
              </div>

              <span className={cn(
                'text-sm leading-tight',
                isSelected ? 'text-red-700 font-semibold' : 'text-gray-700 font-medium'
              )}>
                {option}
              </span>
            </label>
          );
        })}
      </RadioGroup>
    </div>
  );
}

export function SectionIII_SocioEconomic() {
  return (
    <Card className="shadow-sm">
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center gap-3 text-lg">
          <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-red-600 text-white text-sm font-bold">
            III
          </span>
          Socio-Economic Background
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <RadioSection
          label="A. FAMILY ECONOMIC STATUS"
          fieldName="socioEconomicBackground.familyEconomicStatus"
          options={economicStatusOptions}
        />

        {/* Horizontal sections using the grid layout */}
        <div className="space-y-4">
          <RadioSection
            label="B. FAMILY RELATIONSHIP"
            fieldName="socioEconomicBackground.familyRelationship"
            options={satisfactionOptions}
            horizontal
          />
          <RadioSection
            label="C. FAMILY REPUTATION"
            fieldName="socioEconomicBackground.familyReputation"
            options={satisfactionOptions}
            horizontal
          />
          <RadioSection
            label="D. FAMILY SUPPORT"
            fieldName="socioEconomicBackground.familySupport"
            options={satisfactionOptions}
            horizontal
          />
          <RadioSection
            label="E. COMMUNITY ACCEPTABILITY"
            fieldName="socioEconomicBackground.communityAcceptability"
            options={satisfactionOptions}
            horizontal
          />
          <RadioSection
            label="F. OVERALL WELL-BEING"
            fieldName="socioEconomicBackground.overallWellBeing"
            options={satisfactionOptions}
            horizontal
          />
        </div>
      </CardContent>
    </Card>
  );
}
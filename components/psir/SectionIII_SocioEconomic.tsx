'use client';

import { useFormContext, useController } from 'react-hook-form';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
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
}

function RadioSection({ label, fieldName, options }: RadioSectionProps) {
  const { control } = useFormContext<PSIRFormData>();
  const { field } = useController({
    name: fieldName as keyof PSIRFormData,
    control,
  });

  return (
    <div className="border rounded-lg p-4 bg-gray-50">
      <h4 className="text-sm font-semibold text-gray-700 mb-4">{label}</h4>
      <RadioGroup
        value={field.value as string ?? ''}
        onValueChange={field.onChange}
        name={fieldName}
      >
        {options.map((option) => {
          const id = `${fieldName}-${option}`;
          return (
            <div key={option} className="flex items-center gap-2">
              <RadioGroupItem value={option} id={id} />
              <Label htmlFor={id} className="cursor-pointer font-normal">
                {option}
              </Label>
            </div>
          );
        })}
      </RadioGroup>
    </div>
  );
}

export function SectionIII_SocioEconomic() {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <span className="flex h-8 w-8 items-center justify-center rounded-full bg-[var(--brand-primary)] text-white text-sm font-bold">
            III
          </span>
          Socio-Economic Background
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <RadioSection
          label="A. FAMILY ECONOMIC STATUS"
          fieldName="socioEconomicBackground.familyEconomicStatus"
          options={economicStatusOptions}
        />
        <RadioSection
          label="B. FAMILY RELATIONSHIP"
          fieldName="socioEconomicBackground.familyRelationship"
          options={satisfactionOptions}
        />
        <RadioSection
          label="C. FAMILY REPUTATION"
          fieldName="socioEconomicBackground.familyReputation"
          options={satisfactionOptions}
        />
        <RadioSection
          label="D. FAMILY SUPPORT"
          fieldName="socioEconomicBackground.familySupport"
          options={satisfactionOptions}
        />
        <RadioSection
          label="E. COMMUNITY ACCEPTABILITY"
          fieldName="socioEconomicBackground.communityAcceptability"
          options={satisfactionOptions}
        />
        <RadioSection
          label="F. OVERALL WELL-BEING"
          fieldName="socioEconomicBackground.overallWellBeing"
          options={satisfactionOptions}
        />
      </CardContent>
    </Card>
  );
}

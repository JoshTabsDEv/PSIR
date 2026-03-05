'use client';

import { useFormContext } from 'react-hook-form';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import {
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from '@/components/ui/form';
import { cn } from '@/lib/utils';
import type { PSIRFormData } from '@/types/psir';
import { Users, Wallet, Globe } from 'lucide-react';

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
  name: string;
  options: readonly string[];
  gridCols?: string;
  control: any;
}

function CustomRadioSection({ label, name, options, gridCols = "grid-cols-1", control }: RadioSectionProps) {
  return (
    <FormField
      control={control}
      name={name}
      render={({ field }) => (
        <FormItem className="space-y-4">
          <FormLabel className="text-sm font-bold uppercase tracking-wider text-foreground/70">{label}</FormLabel>
          <FormControl>
            <RadioGroup
              onValueChange={field.onChange}
              value={field.value || undefined}
              className={cn("grid gap-3", gridCols)}
            >
              {options.map((option) => {
                const isSelected = field.value === option;
                return (
                  <FormItem key={option} className="flex items-center space-x-0 space-y-0">
                    <FormControl>
                      <RadioGroupItem value={option} id={`${name}-${option}`} className="sr-only" />
                    </FormControl>
                    <FormLabel
                      htmlFor={`${name}-${option}`}
                      className={cn(
                        "flex flex-1 items-center gap-3 rounded-md border px-4 py-2.5 cursor-pointer transition-all duration-200 text-sm font-medium",
                        isSelected
                          ? "border-[var(--brand-primary)] bg-[var(--brand-primary)]/[0.03] text-[var(--brand-primary)] ring-1 ring-[var(--brand-primary)]/20"
                          : "border-border bg-background text-muted-foreground hover:border-border-hover hover:bg-muted/30"
                      )}
                    >
                      <div className={cn(
                        "flex h-4 w-4 shrink-0 items-center justify-center rounded-full border transition-colors",
                        isSelected ? "border-[var(--brand-primary)] bg-[var(--brand-primary)]" : "border-muted-foreground/30"
                      )}>
                        {isSelected && <div className="h-1.5 w-1.5 rounded-full bg-white" />}
                      </div>
                      {option}
                    </FormLabel>
                  </FormItem>
                );
              })}
            </RadioGroup>
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  );
}

export function SectionIII_SocioEconomic() {
  const { control } = useFormContext<PSIRFormData>();

  return (
    <Card className="shadow-none border border-border bg-card/50">
      <CardHeader className="pb-6 border-b bg-card/80">
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-[var(--brand-primary)] px-2 py-0.5 rounded border border-[var(--brand-primary)]/20 bg-[var(--brand-primary)]/5">Section III</span>
              <h2 className="text-2xl font-bold tracking-tight text-foreground">Socio-Economic Background</h2>
            </div>
            <p className="text-sm text-muted-foreground">Family status, relationships, and community acceptability.</p>
          </div>
          <div className="hidden sm:block">
             <Globe className="h-8 w-8 text-muted-foreground/10" />
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-12 pt-8">
        {/* Economic Status */}
        <div className="space-y-6">
          <div className="flex items-center gap-2 pb-2 border-b border-border/50">
            <Wallet className="h-4 w-4 text-[var(--brand-primary)]" />
            <h3 className="text-sm font-bold uppercase tracking-wider text-foreground/80">Economic Standing</h3>
          </div>
          <div className="pl-0 sm:pl-4 border-l-2 border-transparent sm:border-[var(--brand-primary)]/10">
            <CustomRadioSection
              label="Family Economic Status"
              name="socioEconomicBackground.familyEconomicStatus"
              options={economicStatusOptions}
              gridCols="md:grid-cols-2 lg:grid-cols-3"
              control={control}
            />
          </div>
        </div>

        {/* Family Dynamics & Relationship */}
        <div className="space-y-6">
          <div className="flex items-center gap-2 pb-2 border-b border-border/50">
            <Users className="h-4 w-4 text-[var(--brand-primary)]" />
            <h3 className="text-sm font-bold uppercase tracking-wider text-foreground/80">Family & Community Dynamics</h3>
          </div>
          
          <div className="grid gap-10 pl-0 sm:pl-4 border-l-2 border-transparent sm:border-[var(--brand-primary)]/10">
            <CustomRadioSection
              label="Family Relationship"
              name="socioEconomicBackground.familyRelationship"
              options={satisfactionOptions}
              gridCols="md:grid-cols-3"
              control={control}
            />
            <CustomRadioSection
              label="Family Reputation"
              name="socioEconomicBackground.familyReputation"
              options={satisfactionOptions}
              gridCols="md:grid-cols-3"
              control={control}
            />
            <CustomRadioSection
              label="Family Support"
              name="socioEconomicBackground.familySupport"
              options={satisfactionOptions}
              gridCols="md:grid-cols-3"
              control={control}
            />
            <CustomRadioSection
              label="Community Acceptability"
              name="socioEconomicBackground.communityAcceptability"
              options={satisfactionOptions}
              gridCols="md:grid-cols-3"
              control={control}
            />
            <CustomRadioSection
              label="Overall Well-Being"
              name="socioEconomicBackground.overallWellBeing"
              options={satisfactionOptions}
              gridCols="md:grid-cols-3"
              control={control}
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

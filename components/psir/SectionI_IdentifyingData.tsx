'use client';

import { judgeNameStore } from '@/lib/judge-name-store';
import { useMemo, useState } from 'react';
import { useFormContext } from 'react-hook-form';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { DatePicker } from '@/components/ui/date-picker';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import {
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from '@/components/ui/form';
import type { PSIRFormData } from '@/types/psir';
import { civilStatusOptions, educationalAttainmentOptions, religionOptions } from '@/lib/utils/form-helpers';
import { calculateAge } from '@/lib/utils/date-formatters';
import { User, MapPin, Briefcase, Users } from 'lucide-react';

interface SectionIIdentifyingDataProps {
  judgeNames: string[];
  judgeInputMode: 'manual' | 'existing';
  onJudgeInputModeChange: (mode: 'manual' | 'existing') => void;
  onJudgeNamesChange: (judgeNames: string[]) => void;
  onJudgeNameCommit: (judgeName: string) => Promise<void>;
}

function normalizeJudgeName(judgeName: string): string {
  return judgeName.trim().replace(/\s+/g, ' ');
}

function dedupeAndSortJudgeNames(judgeNames: string[]): string[] {
  const uniqueNames = new Map<string, string>();

  for (const judgeName of judgeNames) {
    const normalizedJudgeName = normalizeJudgeName(judgeName);
    if (!normalizedJudgeName) continue;

    uniqueNames.set(normalizedJudgeName.toLowerCase(), normalizedJudgeName);
  }

  return Array.from(uniqueNames.values()).sort((left, right) =>
    left.localeCompare(right, undefined, { sensitivity: 'base' })
  );
}

export function SectionI_IdentifyingData({
  judgeNames,
  judgeInputMode,
  onJudgeInputModeChange,
  onJudgeNamesChange,
  onJudgeNameCommit,
}: SectionIIdentifyingDataProps) {
  const { control, setValue, watch } = useFormContext<PSIRFormData>();
  const [judgeSearch, setJudgeSearch] = useState('');
  const judgeFieldValue = watch('identifyingData.letterJudge');

  const filteredJudgeNames = useMemo(() => {
    const normalizedSearch = judgeSearch.trim().toLowerCase();
    const sourceJudgeNames = dedupeAndSortJudgeNames([
      ...judgeNames,
      normalizeJudgeName(judgeFieldValue || ''),
    ]);

    if (!normalizedSearch) return sourceJudgeNames;

    return sourceJudgeNames.filter((judgeName) =>
      judgeName.toLowerCase().includes(normalizedSearch)
    );
  }, [judgeNames, judgeSearch, judgeFieldValue]);

  return (
    <Card className="shadow-none border border-border bg-card/50">
      <CardHeader className="pb-6 border-b bg-card/80">
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-[var(--brand-primary)] px-2 py-0.5 rounded border border-[var(--brand-primary)]/20 bg-[var(--brand-primary)]/5">Section I</span>
              <h2 className="text-2xl font-bold tracking-tight text-foreground">Identifying Data</h2>
            </div>
            <p className="text-sm text-muted-foreground">Comprehensive personal information and case-related identifiers.</p>
          </div>
          <div className="hidden sm:block">
             <User className="h-8 w-8 text-muted-foreground/10" />
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-10 pt-8">
        {/* Letter Information */}
        <div className="space-y-6">
          <div className="flex items-center justify-between gap-3 pb-2 border-b border-border/50">
            <div className="flex items-center gap-2">
              <Briefcase className="h-4 w-4 text-[var(--brand-primary)]" />
              <h3 className="text-sm font-bold uppercase tracking-wider text-foreground/80">Letter Information</h3>
            </div>
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="border-dashed"
              onClick={async () => {
                onJudgeInputModeChange('manual');
                setJudgeSearch('');
                setValue('identifyingData.letterJudge', '', {
                  shouldDirty: true,
                  shouldTouch: true,
                  shouldValidate: true,
                });

                try {
                  judgeNameStore.clear();
                } catch (error) {
                  console.error('Failed to clear saved judge name:', error);
                }
              }}
            >
              Clear Saved Judge Name
            </Button>
          </div>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 pl-0 sm:pl-4 border-l-2 border-transparent sm:border-[var(--brand-primary)]/10">
            <FormField
              control={control}
              name="identifyingData.letterJudge"
              render={({ field }) => (
                <FormItem>
                  <div className="flex items-center justify-between gap-3">
                    <FormLabel className="flex items-center gap-1">
                      Judge Name <span className="text-destructive">*</span>
                    </FormLabel>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="h-7 px-2 text-xs"
                      onClick={() => {
                        if (judgeInputMode === 'manual') {
                          onJudgeInputModeChange('existing');
                          setJudgeSearch(field.value || '');
                          return;
                        }

                        onJudgeInputModeChange('manual');
                        setJudgeSearch('');
                      }}
                    >
                      {judgeInputMode === 'manual' ? 'Use Existing Judge' : '+ New Judge'}
                    </Button>
                  </div>

                  {judgeInputMode === 'existing' ? (
                    <div className="space-y-2">
                      <Input
                        value={judgeSearch}
                        onChange={(event) => setJudgeSearch(event.target.value)}
                        placeholder="Search judge names"
                        className="bg-background shadow-none focus-visible:ring-1"
                      />
                      <FormControl>
                        <Select
                          value={field.value || ''}
                          onChange={async (event) => {
                            const selectedJudgeName = normalizeJudgeName(event.target.value);
                            field.onChange(selectedJudgeName);
                            if (selectedJudgeName) {
                              onJudgeNamesChange(
                                dedupeAndSortJudgeNames([...judgeNames, selectedJudgeName])
                              );
                              await onJudgeNameCommit(selectedJudgeName);
                            }
                          }}
                          className="bg-background shadow-none focus-visible:ring-1"
                        >
                          <option value="">
                            {filteredJudgeNames.length > 0 ? 'Select an existing judge' : 'No judges found'}
                          </option>
                          {filteredJudgeNames.map((judgeName) => (
                            <option key={judgeName} value={judgeName}>
                              {judgeName}
                            </option>
                          ))}
                        </Select>
                      </FormControl>
                      {judgeNames.length === 0 && (
                        <p className="text-xs text-muted-foreground">
                          No saved judge names yet. Switch to manual input to add one.
                        </p>
                      )}
                    </div>
                  ) : (
                    <FormControl>
                      <Input
                        placeholder="eg. HON. JOHN DOE"
                        {...field}
                        onChange={(event) => {
                          field.onChange(event.target.value);
                        }}
                        onBlur={async (event) => {
                          field.onBlur();
                          const normalizedJudgeName = normalizeJudgeName(event.target.value);
                          if (!normalizedJudgeName) return;

                          field.onChange(normalizedJudgeName);
                          onJudgeNamesChange(
                            dedupeAndSortJudgeNames([...judgeNames, normalizedJudgeName])
                          );
                          await onJudgeNameCommit(normalizedJudgeName);
                        }}
                        className="bg-background shadow-none focus-visible:ring-1"
                      />
                    </FormControl>
                  )}
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={control}
              name="identifyingData.letterCourt"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="flex items-center gap-1">
                    Court <span className="text-destructive">*</span>
                  </FormLabel>
                  <FormControl>
                    <Input placeholder="e.g., RTC BRANCH 1" {...field} className="bg-background shadow-none focus-visible:ring-1" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={control}
              name="identifyingData.letterPosition"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="flex items-center gap-1">
                    Position <span className="text-destructive">*</span>
                  </FormLabel>
                  <FormControl>
                    <Input placeholder="e.g., Presiding Judge" {...field} className="bg-background shadow-none focus-visible:ring-1" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={control}
              name="identifyingData.letterAddress"
              render={({ field }) => (
                <FormItem className="md:col-span-2 lg:col-span-3">
                  <FormLabel className="flex items-center gap-1">
                    Court Address <span className="text-destructive">*</span>
                  </FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Complete Court/Office Address"
                      rows={2}
                      className="resize-none bg-background shadow-none focus-visible:ring-1"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
          
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4 pl-0 sm:pl-4 border-l-2 border-transparent sm:border-[var(--brand-primary)]/10">
            <FormField
              control={control}
              name="identifyingData.investigationDocketNumber"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="flex items-center gap-1">
                    Investigation Docket # <span className="text-destructive">*</span>
                  </FormLabel>
                  <FormControl>
                    <Input placeholder="e.g., PI-2026-0001" {...field} className="bg-background shadow-none focus-visible:ring-1" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={control}
              name="identifyingData.criminalCaseNumber"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="flex items-center gap-1">
                    Criminal Case # <span className="text-destructive">*</span>
                  </FormLabel>
                  <FormControl>
                    <Input placeholder="Case number" {...field} className="bg-background shadow-none focus-visible:ring-1" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={control}
              name="identifyingData.dateOfOrder"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Date of Order</FormLabel>
                  <FormControl>
                    <DatePicker
                      value={field.value ? new Date(field.value as string) : undefined}
                      onChange={(date) => field.onChange(date?.toISOString() || '')}
                      placeholder="Select date"
                      className="w-full h-9 bg-background shadow-none focus-visible:ring-1"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={control}
              name="identifyingData.dateReceived"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Date Received</FormLabel>
                  <FormControl>
                    <DatePicker
                      value={field.value ? new Date(field.value as string) : undefined}
                      onChange={(date) => field.onChange(date?.toISOString() || '')}
                      placeholder="Select date"
                      className="w-full h-9 bg-background shadow-none focus-visible:ring-1"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </div>

        {/* Personal Information */}
        <div className="space-y-6">
          <div className="flex items-center gap-2 pb-2 border-b border-border/50">
            <User className="h-4 w-4 text-[var(--brand-primary)]" />
            <h3 className="text-sm font-bold uppercase tracking-wider text-foreground/80">Personal Information</h3>
          </div>
          
          <div className="space-y-8 pl-0 sm:pl-4 border-l-2 border-transparent sm:border-[var(--brand-primary)]/10">
            {/* Name Fields */}
            <div className="grid gap-4 md:grid-cols-3">
              <FormField
                control={control}
                name="identifyingData.lastName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center gap-1">
                      Last Name <span className="text-destructive">*</span>
                    </FormLabel>
                    <FormControl>
                      <Input placeholder="DELA CRUZ" {...field} className="bg-background shadow-none focus-visible:ring-1" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={control}
                name="identifyingData.firstName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center gap-1">
                      First Name <span className="text-destructive">*</span>
                    </FormLabel>
                    <FormControl>
                      <Input placeholder="JUAN" {...field} className="bg-background shadow-none focus-visible:ring-1" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={control}
                name="identifyingData.middleName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Middle Name</FormLabel>
                    <FormControl>
                      <Input placeholder="SANTOS" {...field} className="bg-background shadow-none focus-visible:ring-1" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* True Name and Alias */}
            <div className="grid gap-4 md:grid-cols-2">
              <FormField
                control={control}
                name="identifyingData.trueName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center gap-1">
                      True Name (Legal/Complete) <span className="text-destructive">*</span>
                    </FormLabel>
                    <FormControl>
                      <Input placeholder="Full legal name" {...field} className="bg-background shadow-none focus-visible:ring-1" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={control}
                name="identifyingData.alias"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Alias / Nickname</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., Jun" {...field} className="bg-background shadow-none focus-visible:ring-1" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Birth Information */}
            <div className="grid gap-4 md:grid-cols-3">
              <FormField
                control={control}
                name="identifyingData.birthday"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center gap-1">
                      Birthday <span className="text-destructive">*</span>
                    </FormLabel>
                    <FormControl>
                      <DatePicker
                        value={field.value ? new Date(field.value as string) : undefined}
                        onChange={(date) => {
                          field.onChange(date?.toISOString() || '');
                          if (date) {
                            setValue('identifyingData.age', calculateAge(date.toISOString()));
                          }
                        }}
                        placeholder="Select date"
                        className="w-full h-9 bg-background shadow-none focus-visible:ring-1"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={control}
                name="identifyingData.age"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Age</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        {...field}
                        value={field.value || ''}
                        onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                        readOnly
                        className="bg-muted/50 shadow-none border-dashed"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={control}
                name="identifyingData.birthplace"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Birthplace</FormLabel>
                    <FormControl>
                      <Input placeholder="City/Province" {...field} className="bg-background shadow-none focus-visible:ring-1" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </div>
        </div>

        {/* Demographics & Family */}
        <div className="space-y-6">
          <div className="flex items-center gap-2 pb-2 border-b border-border/50">
            <Users className="h-4 w-4 text-[var(--brand-primary)]" />
            <h3 className="text-sm font-bold uppercase tracking-wider text-foreground/80">Demographics & Family</h3>
          </div>
          
          <div className="space-y-8 pl-0 sm:pl-4 border-l-2 border-transparent sm:border-[var(--brand-primary)]/10">
            <div className="grid gap-4 md:grid-cols-2">
              <FormField
                control={control}
                name="identifyingData.mother"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Mother&apos;s Maiden Name</FormLabel>
                    <FormControl>
                      <Input placeholder="Full name" {...field} className="bg-background shadow-none focus-visible:ring-1" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={control}
                name="identifyingData.father"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Father&apos;s Name</FormLabel>
                    <FormControl>
                      <Input placeholder="Full name" {...field} className="bg-background shadow-none focus-visible:ring-1" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              <FormField
                control={control}
                name="identifyingData.sex"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center gap-1">
                      Sex <span className="text-destructive">*</span>
                    </FormLabel>
                    <FormControl>
                      <Select {...field} className="h-9 bg-background shadow-none focus-visible:ring-1">
                        <option value="">Select</option>
                        <option value="Male">Male</option>
                        <option value="Female">Female</option>
                      </Select>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={control}
                name="identifyingData.nationality"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nationality</FormLabel>
                    <FormControl>
                      <Input placeholder="Filipino" {...field} className="bg-background shadow-none focus-visible:ring-1" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={control}
                name="identifyingData.religion"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Religion</FormLabel>
                    <FormControl>
                      <Select {...field} className="h-9 bg-background shadow-none focus-visible:ring-1">
                        <option value="">Select</option>
                        {religionOptions.map((religion) => (
                          <option key={religion} value={religion}>{religion}</option>
                        ))}
                      </Select>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={control}
                name="identifyingData.civilStatus"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Civil Status</FormLabel>
                    <FormControl>
                      <Select {...field} className="h-9 bg-background shadow-none focus-visible:ring-1">
                        <option value="">Select</option>
                        {civilStatusOptions.map((status) => (
                          <option key={status} value={status}>{status}</option>
                        ))}
                      </Select>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <FormField
                control={control}
                name="identifyingData.genderPreference"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Gender Preference</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter gender preference" {...field} className="bg-background shadow-none focus-visible:ring-1" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              <FormField
                control={control}
                name="identifyingData.educationalAttainment"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Educational Attainment</FormLabel>
                    <FormControl>
                      <Select {...field} className="h-9 bg-background shadow-none focus-visible:ring-1">
                        <option value="">Select</option>
                        {educationalAttainmentOptions.map((edu) => (
                          <option key={edu} value={edu}>{edu}</option>
                        ))}
                      </Select>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={control}
                name="identifyingData.occupation"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Occupation</FormLabel>
                    <FormControl>
                      <Input placeholder="Current job" {...field} className="bg-background shadow-none focus-visible:ring-1" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={control}
                name="identifyingData.spouseName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Spouse Name</FormLabel>
                    <FormControl>
                      <Input placeholder="Full name" {...field} className="bg-background shadow-none focus-visible:ring-1" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={control}
              name="identifyingData.identifyingMarks"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Identifying Marks / Tattoos</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Describe any scars, tattoos, or distinguishing marks"
                      rows={2}
                      className="resize-none bg-background shadow-none focus-visible:ring-1"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </div>

        {/* Address Details */}
        <div className="space-y-6">
          <div className="flex items-center gap-2 pb-2 border-b border-border/50">
            <MapPin className="h-4 w-4 text-[var(--brand-primary)]" />
            <h3 className="text-sm font-bold uppercase tracking-wider text-foreground/80">Address Details</h3>
          </div>
          <div className="grid gap-6 md:grid-cols-2 pl-0 sm:pl-4 border-l-2 border-transparent sm:border-[var(--brand-primary)]/10">
            <FormField
              control={control}
              name="identifyingData.presentAddress"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="flex items-center gap-1">
                    Present Address <span className="text-destructive">*</span>
                  </FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Current residence"
                      rows={2}
                      className="resize-none bg-background shadow-none focus-visible:ring-1"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={control}
              name="identifyingData.permanentAddress"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="flex items-center gap-1">
                    Permanent Address <span className="text-destructive">*</span>
                  </FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Complete permanent address"
                      rows={2}
                      className="resize-none bg-background shadow-none focus-visible:ring-1"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </div>
      </CardContent>
    </Card>

  );
}

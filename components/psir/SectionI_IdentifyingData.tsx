'use client';

import { useFormContext } from 'react-hook-form';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { DatePicker } from '@/components/ui/date-picker';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
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
import { User, Calendar, MapPin, Briefcase, Users } from 'lucide-react';

export function SectionI_IdentifyingData() {
  const { control, watch, setValue } = useFormContext<PSIRFormData>();

  const birthday = watch('identifyingData.birthday');

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
          <div className="flex items-center gap-2 pb-2 border-b border-border/50">
            <Briefcase className="h-4 w-4 text-[var(--brand-primary)]" />
            <h3 className="text-sm font-bold uppercase tracking-wider text-foreground/80">Letter Information</h3>
          </div>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 pl-0 sm:pl-4 border-l-2 border-transparent sm:border-[var(--brand-primary)]/10">
            <FormField
              control={control}
              name="identifyingData.letterJudge"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Judge Name</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter judge name" {...field} className="bg-background shadow-none focus-visible:ring-1" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={control}
              name="identifyingData.letterCourt"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Court</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g., RTC Branch 1" {...field} className="bg-background shadow-none focus-visible:ring-1" />
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
                  <FormLabel>Position</FormLabel>
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
                  <FormLabel>Court Address</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Complete court/office address"
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
                  <FormLabel>Investigation Docket #</FormLabel>
                  <FormControl>
                    <Input placeholder="Docket number" {...field} className="bg-background shadow-none focus-visible:ring-1" />
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
                  <FormLabel>Criminal Case #</FormLabel>
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
                      <Input placeholder="DELA CRUZ" {...field} className="bg-background shadow-none focus-visible:ring-1 uppercase" />
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
                      <Input placeholder="JUAN" {...field} className="bg-background shadow-none focus-visible:ring-1 uppercase" />
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
                      <Input placeholder="SANTOS" {...field} className="bg-background shadow-none focus-visible:ring-1 uppercase" />
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
                    <FormLabel>True Name (Legal/Complete)</FormLabel>
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
                    <FormLabel>Mother's Maiden Name</FormLabel>
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
                    <FormLabel>Father's Name</FormLabel>
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
                      <Select {...field} className="h-9 bg-background shadow-none focus-visible:ring-1">
                        <option value="">Select</option>
                        <option value="Male">Male</option>
                        <option value="Female">Female</option>
                        <option value="Non-binary">Non-binary</option>
                        <option value="Prefer to self-describe">Prefer to self-describe</option>
                        <option value="Prefer not to answer">Prefer not to answer</option>
                      </Select>
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
                  <FormLabel>Present Address</FormLabel>
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
                  <FormLabel>Permanent Address</FormLabel>
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

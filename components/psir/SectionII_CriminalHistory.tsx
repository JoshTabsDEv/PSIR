'use client';

import { useFormContext } from 'react-hook-form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { DatePicker } from '@/components/ui/date-picker';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import {
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from '@/components/ui/form';
import type { PSIRFormData } from '@/types/psir';
import { Gavel, ShieldAlert, MapPin } from 'lucide-react';

export function SectionII_CriminalHistory() {
  const { control, watch } = useFormContext<PSIRFormData>();

  return (
    <Card className="shadow-none border border-border bg-card/50">
      <CardHeader className="pb-6 border-b bg-card/80">
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-[var(--brand-primary)] px-2 py-0.5 rounded border border-[var(--brand-primary)]/20 bg-[var(--brand-primary)]/5">Section II</span>
              <h2 className="text-2xl font-bold tracking-tight text-foreground">Criminal History</h2>
            </div>
            <p className="text-sm text-muted-foreground">Detailed records of present offense and prior criminal history.</p>
          </div>
          <div className="hidden sm:block">
             <Gavel className="h-8 w-8 text-muted-foreground/10" />
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-10 pt-8">
        {/* A. Present Offense */}
        <div className="space-y-6">
          <div className="flex items-center gap-2 pb-2 border-b border-border/50">
            <ShieldAlert className="h-4 w-4 text-[var(--brand-primary)]" />
            <h3 className="text-sm font-bold uppercase tracking-wider text-foreground/80">Present Offense</h3>
          </div>
          
          <div className="space-y-8 pl-0 sm:pl-4 border-l-2 border-transparent sm:border-[var(--brand-primary)]/10">
            <div className="grid gap-6 md:grid-cols-4">
              <FormField
                control={control}
                name="criminalHistory.presentOffense.chargedWith"
                render={({ field }) => (
                  <FormItem className="md:col-span-3">
                    <FormLabel>Charged with</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., Violation of R.A. 9165" {...field} className="bg-background shadow-none focus-visible:ring-1" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={control}
                name="criminalHistory.presentOffense.chargedDate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Date</FormLabel>
                    <FormControl>
                      <DatePicker
                        value={field.value ? new Date(field.value as string) : undefined}
                        onChange={(date) => field.onChange(date?.toISOString() || null)}
                        placeholder="Select date"
                        className="w-full h-9 bg-background shadow-none focus-visible:ring-1"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid gap-6 md:grid-cols-4">
              <FormField
                control={control}
                name="criminalHistory.presentOffense.convictedOf"
                render={({ field }) => (
                  <FormItem className="md:col-span-3">
                    <FormLabel>Convicted of</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., Illegal possession of dangerous drugs" {...field} className="bg-background shadow-none focus-visible:ring-1" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={control}
                name="criminalHistory.presentOffense.convictedDate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Date</FormLabel>
                    <FormControl>
                      <DatePicker
                        value={field.value ? new Date(field.value as string) : undefined}
                        onChange={(date) => field.onChange(date?.toISOString() || null)}
                        placeholder="Select date"
                        className="w-full h-9 bg-background shadow-none focus-visible:ring-1"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={control}
              name="criminalHistory.presentOffense.sentence"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Sentence</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g., 6 years and 1 day to 12 years imprisonment" {...field} className="bg-background shadow-none focus-visible:ring-1" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </div>

        {/* Custodial Status & Address */}
        <div className="space-y-6">
          <div className="flex items-center gap-2 pb-2 border-b border-border/50">
            <MapPin className="h-4 w-4 text-[var(--brand-primary)]" />
            <h3 className="text-sm font-bold uppercase tracking-wider text-foreground/80">Custodial Status & Residence</h3>
          </div>
          
          <div className="space-y-8 pl-0 sm:pl-4 border-l-2 border-transparent sm:border-[var(--brand-primary)]/10">
            <div className="grid gap-8 md:grid-cols-2">
              <FormField
                control={control}
                name="criminalHistory.custodialStatus"
                render={({ field }) => (
                  <FormItem className="space-y-4">
                    <FormLabel>Custodial Status</FormLabel>
                    <FormControl>
                      <RadioGroup
                        onValueChange={field.onChange}
                        defaultValue={field.value || undefined}
                        className="flex flex-wrap gap-x-6 gap-y-2"
                      >
                        <FormItem className="flex items-center space-x-2 space-y-0">
                          <FormControl>
                            <RadioGroupItem value="On Bail" />
                          </FormControl>
                          <FormLabel className="font-normal text-sm cursor-pointer">On Bail</FormLabel>
                        </FormItem>
                        <FormItem className="flex items-center space-x-2 space-y-0">
                          <FormControl>
                            <RadioGroupItem value="On Detention" />
                          </FormControl>
                          <FormLabel className="font-normal text-sm cursor-pointer">On Detention</FormLabel>
                        </FormItem>
                        <FormItem className="flex items-center space-x-2 space-y-0">
                          <FormControl>
                            <RadioGroupItem value="ROR" />
                          </FormControl>
                          <FormLabel className="font-normal text-sm cursor-pointer">ROR</FormLabel>
                        </FormItem>
                      </RadioGroup>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {watch('criminalHistory.custodialStatus') === 'ROR' && (
                <FormField
                  control={control}
                  name="criminalHistory.rorCustodian"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Custodian Name</FormLabel>
                      <FormControl>
                        <Input placeholder="Name of custodian" {...field} className="bg-background shadow-none focus-visible:ring-1" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}
            </div>

            <FormField
              control={control}
              name="criminalHistory.address"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Complete Address</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Enter full address"
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

        {/* B. Prior and Pending Records */}
        <div className="space-y-6">
          <div className="flex items-center gap-2 pb-2 border-b border-border/50">
            <Gavel className="h-4 w-4 text-[var(--brand-primary)]" />
            <h3 className="text-sm font-bold uppercase tracking-wider text-foreground/80">Prior and Pending Records</h3>
          </div>

          <div className="pl-0 sm:pl-4 border-l-2 border-transparent sm:border-[var(--brand-primary)]/10">
            <div className="overflow-hidden rounded-lg border border-border bg-background">
              <table className="w-full text-sm border-collapse">
                <thead>
                  <tr className="bg-muted/50 border-b border-border">
                    <th className="px-4 py-3 text-left font-bold text-xs uppercase tracking-wider text-muted-foreground">Agency</th>
                    <th className="px-4 py-3 text-left font-bold text-xs uppercase tracking-wider text-muted-foreground">Crim. Case #</th>
                    <th className="px-4 py-3 text-left font-bold text-xs uppercase tracking-wider text-muted-foreground">Offense</th>
                    <th className="px-4 py-3 text-left font-bold text-xs uppercase tracking-wider text-muted-foreground w-40">Date Charged</th>
                    <th className="px-4 py-3 text-left font-bold text-xs uppercase tracking-wider text-muted-foreground">Decision/Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {/* NBI Row */}
                  <tr>
                    <td className="px-4 py-3 font-bold bg-muted/20">NBI</td>
                    <td className="px-2 py-2">
                      <FormField
                        control={control}
                        name="criminalHistory.priorRecords.nbi.criminalCaseNo"
                        render={({ field }) => (
                          <FormControl>
                            <Input {...field} className="h-8 border-transparent bg-transparent shadow-none focus-visible:ring-1 focus-visible:bg-background" />
                          </FormControl>
                        )}
                      />
                    </td>
                    <td className="px-2 py-2">
                      <FormField
                        control={control}
                        name="criminalHistory.priorRecords.nbi.offense"
                        render={({ field }) => (
                          <FormControl>
                            <Input {...field} className="h-8 border-transparent bg-transparent shadow-none focus-visible:ring-1 focus-visible:bg-background" />
                          </FormControl>
                        )}
                      />
                    </td>
                    <td className="px-2 py-2">
                      <FormField
                        control={control}
                        name="criminalHistory.priorRecords.nbi.dateCharged"
                        render={({ field }) => (
                          <FormControl>
                            <Input type="date" {...field} className="h-8 border-transparent bg-transparent shadow-none focus-visible:ring-1 focus-visible:bg-background text-xs" />
                          </FormControl>
                        )}
                      />
                    </td>
                    <td className="px-2 py-2">
                      <FormField
                        control={control}
                        name="criminalHistory.priorRecords.nbi.decisionStatus"
                        render={({ field }) => (
                          <FormControl>
                            <Input {...field} className="h-8 border-transparent bg-transparent shadow-none focus-visible:ring-1 focus-visible:bg-background" />
                          </FormControl>
                        )}
                      />
                    </td>
                  </tr>
                  {/* CMRD Row */}
                  <tr>
                    <td className="px-4 py-3 font-bold bg-muted/20">CMRD</td>
                    <td className="px-2 py-2">
                      <FormField
                        control={control}
                        name="criminalHistory.priorRecords.cmrd.criminalCaseNo"
                        render={({ field }) => (
                          <FormControl>
                            <Input {...field} className="h-8 border-transparent bg-transparent shadow-none focus-visible:ring-1 focus-visible:bg-background" />
                          </FormControl>
                        )}
                      />
                    </td>
                    <td className="px-2 py-2">
                      <FormField
                        control={control}
                        name="criminalHistory.priorRecords.cmrd.offense"
                        render={({ field }) => (
                          <FormControl>
                            <Input {...field} className="h-8 border-transparent bg-transparent shadow-none focus-visible:ring-1 focus-visible:bg-background" />
                          </FormControl>
                        )}
                      />
                    </td>
                    <td className="px-2 py-2">
                      <FormField
                        control={control}
                        name="criminalHistory.priorRecords.cmrd.dateCharged"
                        render={({ field }) => (
                          <FormControl>
                            <Input type="date" {...field} className="h-8 border-transparent bg-transparent shadow-none focus-visible:ring-1 focus-visible:bg-background text-xs" />
                          </FormControl>
                        )}
                      />
                    </td>
                    <td className="px-2 py-2">
                      <FormField
                        control={control}
                        name="criminalHistory.priorRecords.cmrd.decisionStatus"
                        render={({ field }) => (
                          <FormControl>
                            <Input {...field} className="h-8 border-transparent bg-transparent shadow-none focus-visible:ring-1 focus-visible:bg-background" />
                          </FormControl>
                        )}
                      />
                    </td>
                  </tr>
                  {/* Others Row */}
                  <tr>
                    <td className="px-4 py-3 font-bold bg-muted/20">Others</td>
                    <td className="px-2 py-2">
                      <FormField
                        control={control}
                        name="criminalHistory.priorRecords.others.criminalCaseNo"
                        render={({ field }) => (
                          <FormControl>
                            <Input {...field} className="h-8 border-transparent bg-transparent shadow-none focus-visible:ring-1 focus-visible:bg-background" />
                          </FormControl>
                        )}
                      />
                    </td>
                    <td className="px-2 py-2">
                      <FormField
                        control={control}
                        name="criminalHistory.priorRecords.others.offense"
                        render={({ field }) => (
                          <FormControl>
                            <Input {...field} className="h-8 border-transparent bg-transparent shadow-none focus-visible:ring-1 focus-visible:bg-background" />
                          </FormControl>
                        )}
                      />
                    </td>
                    <td className="px-2 py-2">
                      <FormField
                        control={control}
                        name="criminalHistory.priorRecords.others.dateCharged"
                        render={({ field }) => (
                          <FormControl>
                            <Input type="date" {...field} className="h-8 border-transparent bg-transparent shadow-none focus-visible:ring-1 focus-visible:bg-background text-xs" />
                          </FormControl>
                        )}
                      />
                    </td>
                    <td className="px-2 py-2">
                      <FormField
                        control={control}
                        name="criminalHistory.priorRecords.others.decisionStatus"
                        render={({ field }) => (
                          <FormControl>
                            <Input {...field} className="h-8 border-transparent bg-transparent shadow-none focus-visible:ring-1 focus-visible:bg-background" />
                          </FormControl>
                        )}
                      />
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
            
            <p className="mt-4 text-[10px] leading-relaxed text-muted-foreground italic">
              * The Office reserves the right to submit supplemental report once records verification yields derogatory result. Also attach the Sinumpaang Salaysay.
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

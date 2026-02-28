'use client';

import { useFormContext, useController } from 'react-hook-form';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { DatePicker } from '@/components/ui/date-picker';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import type { PSIRFormData } from '@/types/psir';

export function SectionII_CriminalHistory() {
  const { register, control, watch, setValue } = useFormContext<PSIRFormData>();

  const { field: custodialField } = useController({
    name: 'criminalHistory.custodialStatus',
    control,
  });

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <span className="flex h-8 w-8 items-center justify-center rounded-full bg-[var(--brand-primary)] text-white text-sm font-bold">
            II
          </span>
          Criminal History
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* A. Present Offense */}
        <div className="border rounded-lg p-4 bg-gray-50">
          <h4 className="text-sm font-semibold text-gray-700 mb-4">A. Present Offense</h4>

          <div className="grid gap-4 md:grid-cols-4 text-gray-900">
            {/* Takes up 3 columns */}
            <div className="space-y-2 md:col-span-3">
              <Label htmlFor="chargedWith">Charged with</Label>
              <Input
                id="chargedWith"
                {...register('criminalHistory.presentOffense.chargedWith')}
                placeholder="e.g., Violation of R.A. 9165"
              />
            </div>

            {/* Takes up 1 column */}
            <div className="space-y-2">
              <Label htmlFor="chargedDate">Date</Label>
              <div className="w-full">
                <DatePicker
                  value={watch('criminalHistory.presentOffense.chargedDate') ? new Date(watch('criminalHistory.presentOffense.chargedDate')!) : undefined}
                  onChange={(date) => setValue('criminalHistory.presentOffense.chargedDate', date ?? null)}
                  placeholder="Select date"
                  className="w-full" // Ensure the button inside fills the column
                />
              </div>
            </div>
          </div>

          {/* Convicted of + Date */}
          <div className="mt-4 grid gap-4 md:grid-cols-4 text-gray-900">
            {/* Convicted Of - Spans 75% of the row */}
            <div className="space-y-2 md:col-span-3">
              <Label htmlFor="convictedOf">Convicted of</Label>
              <Input
                id="convictedOf"
                {...register('criminalHistory.presentOffense.convictedOf')}
                placeholder="e.g., Illegal possession of dangerous drugs"
                className="h-10" // Ensures height consistency
              />
            </div>

            {/* Date - Spans 25% of the row */}
            <div className="space-y-2">
              <Label htmlFor="convictedDate">Date</Label>
              <div className="w-full">
                <DatePicker
                  value={watch('criminalHistory.presentOffense.convictedDate') ? new Date(watch('criminalHistory.presentOffense.convictedDate')!) : undefined}
                  onChange={(date) => setValue('criminalHistory.presentOffense.convictedDate', date ?? null)}
                  placeholder="Select date"
                  // Force the DatePicker to fill its 1/4th of the grid
                  className="w-full h-10"
                />
              </div>
            </div>
          </div>
          {/* Sentence */}
          <div className="mt-4 space-y-2 text-gray-900">
            <Label htmlFor="sentence">Sentence</Label>
            <Input
              id="sentence"
              {...register('criminalHistory.presentOffense.sentence')}
              placeholder="e.g., 6 years and 1 day to 12 years imprisonment"
            />
          </div>

        </div>

        {/* Custodial Status */}
        <div className="space-y-2 text-gray-900">
          <Label>Custodial Status</Label>
          <RadioGroup
            value={custodialField.value ?? ''}
            onValueChange={custodialField.onChange}
            name="criminalHistory.custodialStatus"
            className="flex flex-wrap gap-x-6 gap-y-2"
          >
            {(['On Bail', 'On Detention'] as const).map((option) => (
              <div key={option} className="flex items-center gap-2">
                <RadioGroupItem value={option} id={`custodial-${option}`} />
                <Label htmlFor={`custodial-${option}`} className="cursor-pointer font-normal">
                  {option}
                </Label>
              </div>
            ))}
            <div className="flex items-center gap-2">
              <RadioGroupItem value="ROR" id="custodial-ROR" />
              <Label htmlFor="custodial-ROR" className="cursor-pointer font-normal">
                ROR – Custodian:
              </Label>
              <Input
                {...register('criminalHistory.rorCustodian')}
                placeholder="Custodian name"
                disabled={custodialField.value !== 'ROR'}
                className="max-w-xs"
              />
            </div>
          </RadioGroup>
        </div>

        {/* Address */}
        <div className="space-y-2 text-gray-900">
          <Label htmlFor="address">Address</Label>
          <Textarea
            id="address"
            {...register('criminalHistory.address')}
            placeholder="Complete address"
            rows={2}
          />
        </div>

        {/* B. Prior and Pending Records */}
        <div className="border-t pt-4 text-gray-900">
          <h4 className="text-sm font-semibold text-gray-700 mb-4">B. Prior and Pending Records</h4>

          <div className="overflow-x-auto">
            <table className="w-full border-collapse border border-gray-300 text-sm">
              <thead>
                <tr className="bg-gray-100">
                  <th className="border border-gray-300 px-3 py-2 text-left font-semibold">Agency</th>
                  <th className="border border-gray-300 px-3 py-2 text-left font-semibold">Criminal Case No.</th>
                  <th className="border border-gray-300 px-3 py-2 text-left font-semibold">Offense</th>
                  <th className="border border-gray-300 px-3 py-2 text-left font-semibold">Date Charged</th>
                  <th className="border border-gray-300 px-3 py-2 text-left font-semibold">Decision/Status of the Case</th>
                </tr>
              </thead>
              <tbody>
                {/* NBI Row */}
                <tr>
                  <td className="border border-gray-300 px-3 py-2 font-medium">NBI</td>
                  <td className="border border-gray-300 px-1 py-1">
                    <Input
                      {...register('criminalHistory.priorRecords.nbi.criminalCaseNo')}
                      className="border-0 shadow-none h-8"
                    />
                  </td>
                  <td className="border border-gray-300 px-1 py-1">
                    <Input
                      {...register('criminalHistory.priorRecords.nbi.offense')}
                      className="border-0 shadow-none h-8"
                    />
                  </td>
                  <td className="border border-gray-300 px-1 py-1">
                    <Input
                      type="date"
                      {...register('criminalHistory.priorRecords.nbi.dateCharged')}
                      className="border-0 shadow-none h-8"
                    />
                  </td>
                  <td className="border border-gray-300 px-1 py-1">
                    <Input
                      {...register('criminalHistory.priorRecords.nbi.decisionStatus')}
                      className="border-0 shadow-none h-8"
                    />
                  </td>
                </tr>
                {/* CMRD/CMRU Row */}
                <tr>
                  <td className="border border-gray-300 px-3 py-2 font-medium">CMRD/CMRU</td>
                  <td className="border border-gray-300 px-1 py-1">
                    <Input
                      {...register('criminalHistory.priorRecords.cmrd.criminalCaseNo')}
                      className="border-0 shadow-none h-8"
                    />
                  </td>
                  <td className="border border-gray-300 px-1 py-1">
                    <Input
                      {...register('criminalHistory.priorRecords.cmrd.offense')}
                      className="border-0 shadow-none h-8"
                    />
                  </td>
                  <td className="border border-gray-300 px-1 py-1">
                    <Input
                      type="date"
                      {...register('criminalHistory.priorRecords.cmrd.dateCharged')}
                      className="border-0 shadow-none h-8"
                    />
                  </td>
                  <td className="border border-gray-300 px-1 py-1">
                    <Input
                      {...register('criminalHistory.priorRecords.cmrd.decisionStatus')}
                      className="border-0 shadow-none h-8"
                    />
                  </td>
                </tr>
                {/* Others Row */}
                <tr>
                  <td className="border border-gray-300 px-3 py-2 font-medium">Others</td>
                  <td className="border border-gray-300 px-1 py-1">
                    <Input
                      {...register('criminalHistory.priorRecords.others.criminalCaseNo')}
                      className="border-0 shadow-none h-8"
                    />
                  </td>
                  <td className="border border-gray-300 px-1 py-1">
                    <Input
                      {...register('criminalHistory.priorRecords.others.offense')}
                      className="border-0 shadow-none h-8"
                    />
                  </td>
                  <td className="border border-gray-300 px-1 py-1">
                    <Input
                      type="date"
                      {...register('criminalHistory.priorRecords.others.dateCharged')}
                      className="border-0 shadow-none h-8"
                    />
                  </td>
                  <td className="border border-gray-300 px-1 py-1">
                    <Input
                      {...register('criminalHistory.priorRecords.others.decisionStatus')}
                      className="border-0 shadow-none h-8"
                    />
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          <p className="text-xs text-gray-500 mt-2 italic">
            The Office reserves the right to submit supplemental report once records verification from the institution and/or law-enforcement agencies yields derogatory result or previous criminal records. Also attach the Sinumpaang Salaysay.
          </p>
        </div>
      </CardContent>
    </Card>
  );
}

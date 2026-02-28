'use client';

import { useFormContext } from 'react-hook-form';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { DatePicker } from '@/components/ui/date-picker';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import type { PSIRFormData } from '@/types/psir';
import { civilStatusOptions, educationalAttainmentOptions, religionOptions } from '@/lib/utils/form-helpers';
import { calculateAge } from '@/lib/utils/date-formatters';

export function SectionI_IdentifyingData() {
  const { register, watch, setValue, formState: { errors } } = useFormContext<PSIRFormData>();

  const birthday = watch('identifyingData.birthday');

  const handleBirthdayChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const date = e.target.value;
    setValue('identifyingData.birthday', new Date(date));
    setValue('identifyingData.age', calculateAge(date));
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <span className="flex h-8 w-8 items-center justify-center rounded-full bg-[var(--brand-primary)] text-white text-sm font-bold">
            I
          </span>
          Identifying Data
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Letter Information */}
        <div className="border-t pt-4">
          <h4 className="text-sm font-medium text-gray-700 mb-3">Letter Information</h4>
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2 text-gray-900">
              <Label htmlFor="letterJudge">Judge</Label>
              <Input
                id="letterJudge"
                {...register('identifyingData.letterJudge')}
                placeholder="Judge name for letter heading"
              />
            </div>
            <div className="space-y-2 text-gray-900">
              <Label htmlFor="letterCourt">Court</Label>
              <Input
                id="letterCourt"
                {...register('identifyingData.letterCourt')}
                placeholder="e.g., RTC Branch 1, Manila"
              />
            </div>
            <div className="space-y-2 text-gray-900">
              <Label htmlFor="letterPosition">Position</Label>
              <Input
                id="letterPosition"
                {...register('identifyingData.letterPosition')}
                placeholder="e.g., Presiding Judge"
              />
            </div>
            <div className="space-y-2 md:col-span-2 text-gray-900">
              <Label htmlFor="letterAddress">Address</Label>
              <Textarea
                id="letterAddress"
                {...register('identifyingData.letterAddress')}
                placeholder="Court/office address for letter"
                rows={2}
              />
            </div>
            <div className="space-y-2 text-gray-900">
              <Label htmlFor="investigationDocketNumber">Investigation Docket Number</Label>
              <Input
                id="investigationDocketNumber"
                {...register('identifyingData.investigationDocketNumber')}
                placeholder="Enter investigation docket number"
              />
            </div>
            <div className="space-y-2 text-gray-900">
              <Label htmlFor="criminalCaseNumber">Criminal Case Number</Label>
              <Input
                id="criminalCaseNumber"
                {...register('identifyingData.criminalCaseNumber')}
                placeholder="Enter criminal case number"
              />
            </div>
          </div>
        </div>
        <div className="border-t pt-4"></div>
        {/* Name Fields */}
        <div className="grid gap-4 md:grid-cols-3">
          <div className="space-y-2 text-gray-900">
            <Label htmlFor="lastName">Last Name *</Label>
            <Input
              id="lastName"
              {...register('identifyingData.lastName')}
              placeholder="e.g., DELA CRUZ"
            />
            {errors.identifyingData?.lastName && (
              <p className="text-sm text-red-500">{errors.identifyingData.lastName.message}</p>
            )}
          </div>
          <div className="space-y-2 text-gray-900">
            <Label htmlFor="firstName">First Name *</Label>
            <Input
              id="firstName"
              {...register('identifyingData.firstName')}
              placeholder="e.g., JUAN"
            />
            {errors.identifyingData?.firstName && (
              <p className="text-sm text-red-500">{errors.identifyingData.firstName.message}</p>
            )}
          </div>
          <div className="space-y-2 text-gray-900">
            <Label htmlFor="middleName">Middle Name</Label>
            <Input
              id="middleName"
              {...register('identifyingData.middleName')}
              placeholder="e.g., SANTOS"
            />
          </div>
        </div>

        {/* True Name */}
        <div className="space-y-2 text-gray-900">
          <Label htmlFor="trueName">True Name</Label>
          <Input
            id="trueName"
            {...register('identifyingData.trueName')}
            placeholder="Legal/complete true name"
          />
        </div>

        {/* Alias and Sex */}
        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2 text-gray-900">
            <Label htmlFor="alias">Alias/Nickname</Label>
            <Input
              id="alias"
              {...register('identifyingData.alias')}
              placeholder="e.g., Jun"
            />
          </div>
          <div className="space-y-2 text-gray-900">
            <Label htmlFor="sex">Sex *</Label>
            <Select {...register('identifyingData.sex')}>
              <option value="Male">Male</option>
              <option value="Female">Female</option>
            </Select>
          </div>
        </div>

        {/* Birthday, Age, Birthplace */}
        <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3 items-end">
          {/* Birthday Field */}
          <div className="flex flex-col space-y-2 text-gray-900">
            <Label htmlFor="birthday" className="text-sm font-medium">
              Birthday *
            </Label>
            <div className="w-full">
              <DatePicker
                value={birthday ? new Date(birthday) : undefined}
                onChange={(date) => {
                  setValue('identifyingData.birthday', date as Date);
                  setValue('identifyingData.age', date ? calculateAge(date.toISOString()) : 0);
                }}
                placeholder="Select date of birth"
                // Ensure your DatePicker component accepts a className to set w-full
                className="w-full"
              />
            </div>
          </div>

          {/* Age Field */}
          <div className="flex flex-col space-y-2 text-gray-900">
            <Label htmlFor="age" className="text-sm font-medium">
              Age
            </Label>
            <Input
              id="age"
              type="number"
              {...register('identifyingData.age', { valueAsNumber: true })}
              readOnly
              className="bg-gray-50 h-10" // Force height if DatePicker is taller
            />
          </div>

          {/* Birthplace Field */}
          <div className="flex flex-col space-y-2 text-gray-900">
            <Label htmlFor="birthplace" className="text-sm font-medium">
              Birthplace
            </Label>
            <Input
              id="birthplace"
              {...register('identifyingData.birthplace')}
              placeholder="e.g., Manila"
              className="h-10"
            />
          </div>
        </div>

        {/* Nationality, Religion, Civil Status */}
        <div className="grid gap-4 md:grid-cols-3">
          <div className="space-y-2 text-gray-900">
            <Label htmlFor="nationality">Nationality</Label>
            <Input
              id="nationality"
              {...register('identifyingData.nationality')}
              placeholder="e.g., Filipino"
            />
          </div>
          <div className="space-y-2 text-gray-900">
            <Label htmlFor="religion">Religion</Label>
            <Select {...register('identifyingData.religion')} className="text-gray-900">
              <option value="">Select religion</option>
              {religionOptions.map((religion) => (
                <option key={religion} value={religion}>{religion}</option>
              ))}
            </Select>
          </div>
          <div className="space-y-2 text-gray-900">
            <Label htmlFor="civilStatus">Civil Status</Label>
            <Select {...register('identifyingData.civilStatus')} className="text-gray-900">
              <option value="">Select status</option>
              {civilStatusOptions.map((status) => (
                <option key={status} value={status}>{status}</option>
              ))}
            </Select>
          </div>
        </div>

        {/* Education and Occupation */}
        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2 text-gray-900">
            <Label htmlFor="educationalAttainment">Educational Attainment</Label>
            <Select {...register('identifyingData.educationalAttainment')} className="text-gray-900">
              <option value="">Select education</option>
              {educationalAttainmentOptions.map((edu) => (
                <option key={edu} value={edu}>{edu}</option>
              ))}
            </Select>
          </div>
          <div className="space-y-2 text-gray-900">
            <Label htmlFor="occupation">Occupation</Label>
            <Input
              id="occupation"
              {...register('identifyingData.occupation')}
              placeholder="e.g., Farmer"
            />
          </div>
        </div>

        {/* Spouse Name */}
        <div className="space-y-2 text-gray-900">
          <Label htmlFor="spouseName">Spouse Name</Label>
          <Input
            id="spouseName"
            {...register('identifyingData.spouseName')}
            placeholder="Full name of spouse (if applicable)"
          />
        </div>

        {/* Identifying Marks */}
        <div className="space-y-2 text-gray-900">
          <Label htmlFor="identifyingMarks">Identifying Marks/Tattoos</Label>
          <Textarea
            id="identifyingMarks"
            {...register('identifyingData.identifyingMarks')}
            placeholder="Describe any scars, tattoos, or distinguishing marks"
            rows={2}
          />
        </div>

        {/* Address Fields */}
        <div className="border-t pt-4">
          <h4 className="text-sm font-medium text-gray-700 mb-3">Address Information</h4>
          <div className="space-y-4">
            <div className="space-y-2 text-gray-900">
              <Label htmlFor="presentAddress">Present Address</Label>
              <Textarea
                id="presentAddress"
                {...register('identifyingData.presentAddress')}
                placeholder="Current address where offender resides"
                rows={2}
              />
            </div>
            <div className="space-y-2 text-gray-900">
              <Label htmlFor="permanentAddress">Permanent Address</Label>
              <Textarea
                id="permanentAddress"
                {...register('identifyingData.permanentAddress')}
                placeholder="Complete permanent address"
                rows={2}
              />
            </div>
          </div>
        </div>

        
      </CardContent>
    </Card>
  );
}

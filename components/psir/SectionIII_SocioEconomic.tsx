'use client';

import { useFormContext } from 'react-hook-form';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
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

export function SectionIII_SocioEconomic() {
  const { register, watch } = useFormContext<PSIRFormData>();

  const familyEconomicStatus = watch('socioEconomicBackground.familyEconomicStatus');
  const familyRelationship = watch('socioEconomicBackground.familyRelationship');
  const familyReputation = watch('socioEconomicBackground.familyReputation');
  const familySupport = watch('socioEconomicBackground.familySupport');
  const communityAcceptability = watch('socioEconomicBackground.communityAcceptability');
  const overallWellBeing = watch('socioEconomicBackground.overallWellBeing');

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <span className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-600 text-white text-sm font-bold">
            III
          </span>
          Socio-Economic Background
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* A. Family Economic Status */}
        <div className="border rounded-lg p-4 bg-gray-50">
          <h4 className="text-sm font-semibold text-gray-700 mb-4">A. FAMILY ECONOMIC STATUS</h4>
          <div className="space-y-2">
            {economicStatusOptions.map((option) => (
              <label key={option} className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  value={option}
                  {...register('socioEconomicBackground.familyEconomicStatus')}
                  checked={familyEconomicStatus === option}
                  className="h-4 w-4 text-blue-600"
                />
                <span className="text-sm">{option}</span>
              </label>
            ))}
          </div>
        </div>

        {/* B. Family Relationship */}
        <div className="border rounded-lg p-4 bg-gray-50">
          <h4 className="text-sm font-semibold text-gray-700 mb-4">B. FAMILY RELATIONSHIP</h4>
          <div className="space-y-2">
            {satisfactionOptions.map((option) => (
              <label key={option} className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  value={option}
                  {...register('socioEconomicBackground.familyRelationship')}
                  checked={familyRelationship === option}
                  className="h-4 w-4 text-blue-600"
                />
                <span className="text-sm">{option}</span>
              </label>
            ))}
          </div>
        </div>

        {/* C. Family Reputation */}
        <div className="border rounded-lg p-4 bg-gray-50">
          <h4 className="text-sm font-semibold text-gray-700 mb-4">C. FAMILY REPUTATION</h4>
          <div className="space-y-2">
            {satisfactionOptions.map((option) => (
              <label key={option} className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  value={option}
                  {...register('socioEconomicBackground.familyReputation')}
                  checked={familyReputation === option}
                  className="h-4 w-4 text-blue-600"
                />
                <span className="text-sm">{option}</span>
              </label>
            ))}
          </div>
        </div>

        {/* D. Family Support */}
        <div className="border rounded-lg p-4 bg-gray-50">
          <h4 className="text-sm font-semibold text-gray-700 mb-4">D. FAMILY SUPPORT</h4>
          <div className="space-y-2">
            {satisfactionOptions.map((option) => (
              <label key={option} className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  value={option}
                  {...register('socioEconomicBackground.familySupport')}
                  checked={familySupport === option}
                  className="h-4 w-4 text-blue-600"
                />
                <span className="text-sm">{option}</span>
              </label>
            ))}
          </div>
        </div>

        {/* E. Community Acceptability */}
        <div className="border rounded-lg p-4 bg-gray-50">
          <h4 className="text-sm font-semibold text-gray-700 mb-4">E. COMMUNITY ACCEPTABILITY</h4>
          <div className="space-y-2">
            {satisfactionOptions.map((option) => (
              <label key={option} className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  value={option}
                  {...register('socioEconomicBackground.communityAcceptability')}
                  checked={communityAcceptability === option}
                  className="h-4 w-4 text-blue-600"
                />
                <span className="text-sm">{option}</span>
              </label>
            ))}
          </div>
        </div>

        {/* F. Overall Well-Being */}
        <div className="border rounded-lg p-4 bg-gray-50">
          <h4 className="text-sm font-semibold text-gray-700 mb-4">F. OVERALL WELL-BEING</h4>
          <div className="space-y-2">
            {satisfactionOptions.map((option) => (
              <label key={option} className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  value={option}
                  {...register('socioEconomicBackground.overallWellBeing')}
                  checked={overallWellBeing === option}
                  className="h-4 w-4 text-blue-600"
                />
                <span className="text-sm">{option}</span>
              </label>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

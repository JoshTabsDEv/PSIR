'use client';

import { useState } from 'react';
import { useFormContext, useWatch } from 'react-hook-form';
import { toast } from 'sonner';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Sparkles, Loader2 } from 'lucide-react';
import type { PSIRFormData } from '@/types/psir';

type ToneSuggestion = 'Objective' | 'Empathetic' | 'Firm';

export function SectionIV_Analysis() {
  const { register, control, watch, setValue } = useFormContext<PSIRFormData>();
  const [selectedTone, setSelectedTone] = useState<ToneSuggestion>('Objective');
  const [manualPrompt, setManualPrompt] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [summaries, setSummaries] = useState<{
    criminalHistory: string;
    socioEconomicBackground: string;
  } | null>(null);

  // Watch form values for AI context
  const identifyingData = useWatch({ control, name: 'identifyingData' });
  const criminalHistory = useWatch({ control, name: 'criminalHistory' });
  const socioEconomicBackground = useWatch({ control, name: 'socioEconomicBackground' });

  // Watch the circumstances field for character count
  const circumstances = watch('analysisEvaluation.circumstances') || '';

  const totalChars = circumstances.length;
  const maxChars = 5000;

  const generateSummaries = async () => {
    setIsGenerating(true);
    try {
      const response = await fetch('/api/ai/generate-summaries', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          identifyingData,
          criminalHistory,
          socioEconomicBackground,
        }),
      });

      const result = await response.json();
      if (result.success) {
        setSummaries(result.data);
        toast.success('Summaries generated successfully!');
      } else {
        toast.error('Failed to generate summaries', {
          description: result.error || 'Please check your API key configuration.',
        });
      }
    } catch (error: any) {
      console.error('Failed to generate summaries:', error);
      toast.error('Failed to generate summaries', {
        description: error?.message || 'An unexpected error occurred.',
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const generateRecommendations = async () => {
    setIsGenerating(true);
    try {
      const response = await fetch('/api/ai/generate-recommendations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          identifyingData,
          criminalHistory,
          socioEconomicBackground,
          tone: selectedTone.toLowerCase(),
          manualPrompt,
        }),
      });

      const result = await response.json();
      if (result.success) {
        // Append recommendations to the existing content
        const currentContent = circumstances;
        const newContent = currentContent
          ? `${currentContent}\n\n--- AI-Generated Recommendations ---\n${result.data.recommendations}`
          : result.data.recommendations;
        setValue('analysisEvaluation.circumstances', newContent);
        toast.success('Recommendations generated successfully!');
      } else {
        toast.error('Failed to generate recommendations', {
          description: result.error || 'Please check your API key configuration.',
        });
      }
    } catch (error: any) {
      console.error('Failed to generate recommendations:', error);
      toast.error('Failed to generate recommendations', {
        description: error?.message || 'An unexpected error occurred.',
      });
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <span className="flex h-8 w-8 items-center justify-center rounded-full bg-[var(--brand-primary)] text-white text-sm font-bold">
            IV
          </span>
          Analysis and Evaluation
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid gap-6 lg:grid-cols-[1fr_400px]">
          {/* Left Panel: Investigator's Assessment Workspace */}
          <div className="space-y-4">
            <div className="flex items-center justify-between border-b pb-3">
              <div className="flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-[var(--brand-primary)]" />
                <h3 className="text-sm font-semibold text-gray-900">
                  Investigator&apos;s Assessment Workspace
                </h3>
              </div>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={generateRecommendations}
                disabled={isGenerating}
              >
                {isGenerating ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Generating...
                  </>
                ) : (
                  <>
                    <Sparkles className="mr-2 h-4 w-4" />
                    Draft with AI
                  </>
                )}
              </Button>
            </div>

            {/* Tone Suggestions */}
            <div>
              <Label className="text-xs text-gray-500 mb-2 block">TONE SUGGESTIONS:</Label>
              <div className="flex gap-2">
                {(['Objective', 'Empathetic', 'Firm'] as ToneSuggestion[]).map((tone) => (
                  <button
                    key={tone}
                    type="button"
                    onClick={() => setSelectedTone(tone)}
                    className={`px-3 py-1 text-xs font-medium rounded-md transition-colors ${
                      selectedTone === tone
                        ? 'bg-[var(--brand-primary)] text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    {tone}
                  </button>
                ))}
              </div>
            </div>

            {/* Manual Prompt Input */}
            <div className="space-y-2">
              <Label htmlFor="manualPrompt" className="text-xs text-gray-500">
                MANUAL PROMPT (OPTIONAL):
              </Label>
              <Textarea
                id="manualPrompt"
                value={manualPrompt}
                onChange={(e) => setManualPrompt(e.target.value)}
                placeholder="Example: Emphasize restorative justice, include concrete supervision conditions, and keep the conclusion direct."
                rows={4}
                className="resize-none text-sm"
              />
            </div>

            {/* Main Assessment Workspace */}
            <div className="space-y-2">
              <Textarea
                id="circumstances"
                {...register('analysisEvaluation.circumstances')}
                placeholder="Synthesize your findings here... Use the AI assistant on the right for summaries of previous sections.

Include:
• Circumstances of the offense
• Identified needs and rehabilitative requirements
• Attitude towards the offense and willingness to change
• Recommendations for supervision and rehabilitation programs"
                rows={20}
                className="resize-none font-mono text-sm"
              />
            </div>

            {/* Character Counter */}
            <div className="text-right">
              <span className={`text-xs ${totalChars > maxChars ? 'text-red-600' : 'text-gray-500'}`}>
                {totalChars.toLocaleString()} / {maxChars.toLocaleString()} characters
              </span>
            </div>
          </div>

          {/* Right Panel: AI Assistant */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 border-b pb-3">
              <Sparkles className="h-5 w-5 text-purple-600" />
              <h3 className="text-sm font-semibold text-purple-900">AI ASSISTANT</h3>
            </div>

            {/* Generate Summaries Button */}
            {!summaries && (
              <Button
                type="button"
                variant="outline"
                className="w-full"
                onClick={generateSummaries}
                disabled={isGenerating}
              >
                {isGenerating ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Generating Summaries...
                  </>
                ) : (
                  'Generate Section Summaries'
                )}
              </Button>
            )}

            {/* Summaries */}
            {summaries && (
              <div className="space-y-4">
                {/* Criminal History Summary */}
                <div className="rounded-lg border border-gray-200 bg-gray-50 p-4">
                  <h4 className="text-sm font-semibold text-gray-700 mb-2">
                    Summary: Criminal History
                  </h4>
                  <p className="text-xs text-gray-600 leading-relaxed">
                    {summaries.criminalHistory}
                  </p>
                </div>

                {/* Socio-Economic Summary */}
                <div className="rounded-lg border border-gray-200 bg-gray-50 p-4">
                  <h4 className="text-sm font-semibold text-gray-700 mb-2">
                    Summary: Socio-Economic
                  </h4>
                  <p className="text-xs text-gray-600 leading-relaxed">
                    {summaries.socioEconomicBackground}
                  </p>
                </div>

                {/* Generate Recommendations Preview */}
                <Button
                  type="button"
                  variant="default"
                  className="w-full bg-purple-600 hover:bg-purple-700"
                  onClick={generateRecommendations}
                  disabled={isGenerating}
                >
                  {isGenerating ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Generating...
                    </>
                  ) : (
                    'Generate Recommendations Preview'
                  )}
                </Button>
              </div>
            )}
          </div>
        </div>

        {/* Probation Period */}
        <div className="border-t mt-8 pt-6">
          <h4 className="text-sm font-semibold text-gray-700 mb-4">Probation Period</h4>
          <div className="border rounded-lg p-4 bg-gray-50">
            <div className="space-y-2">
              <Label htmlFor="probationPeriod">Probation Period</Label>
              <Input
                id="probationPeriod"
                {...register('analysisEvaluation.probationPeriod')}
                placeholder="e.g., 3 years, 6 months"
              />
              <p className="text-xs text-gray-500">Specify the recommended probation period duration</p>
            </div>
          </div>
        </div>

        {/* Community Service Recommendation */}
        <div className="border-t mt-8 pt-6">
          <h4 className="text-sm font-semibold text-gray-700 mb-4">Community Service Recommendation</h4>

          <div className="grid gap-6 md:grid-cols-2">
            {/* Hours */}
            <div className="border rounded-lg p-4 bg-gray-50">
              <div className="space-y-2">
                <Label htmlFor="communityServiceHours">Hours Required</Label>
                <Input
                  id="communityServiceHours"
                  type="number"
                  {...register('analysisEvaluation.communityServiceHours', {
                    valueAsNumber: true,
                    min: 0
                  })}
                  placeholder="e.g., 40"
                  min="0"
                />
                <p className="text-xs text-gray-500">Total hours of community service recommended</p>
              </div>
            </div>

            {/* Type of Service */}
            <div className="border rounded-lg p-4 bg-gray-50">
              <div className="space-y-2">
                <Label htmlFor="communityServiceType">How many to plant</Label>
                <Textarea
                  id="communityServiceType"
                  {...register('analysisEvaluation.communityServiceType')}
                  placeholder="e.g., Fifty (50) fruit-bearing trees, trees that can be used as lumber"
                  rows={3}
                  className="resize-none"
                />
                <p className="text-xs text-gray-500">Describe how many trees to plant and their purpose</p>
              </div>
            </div>
          </div>
        </div>

        {/* Prepared By */}
        <div className="border-t mt-8 pt-6">
          <h4 className="text-sm font-semibold text-gray-700 mb-4">Prepared By</h4>

          <div className="grid gap-4 md:grid-cols-3">
            <div className="space-y-2">
              <Label htmlFor="preparedByName">Name</Label>
              <Input
                id="preparedByName"
                {...register('analysisEvaluation.preparedBy.name')}
                placeholder="Enter preparer name"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="preparedByDesignation">Designation</Label>
              <Input
                id="preparedByDesignation"
                {...register('analysisEvaluation.preparedBy.designation')}
                placeholder="Enter preparer designation"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="preparedByDate">Date</Label>
              <Input
                id="preparedByDate"
                type="date"
                {...register('analysisEvaluation.preparedBy.date')}
              />
            </div>
          </div>
        </div>

        {/* Reviewed By */}
        <div className="border-t mt-8 pt-6">
          <h4 className="text-sm font-semibold text-gray-700 mb-4">Reviewed By</h4>

          <div className="grid gap-4 md:grid-cols-3">
            <div className="space-y-2">
              <Label htmlFor="reviewedByName">Name</Label>
              <Input
                id="reviewedByName"
                {...register('analysisEvaluation.reviewedBy.name')}
                placeholder="Enter reviewer name"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="reviewedByDesignation">Designation</Label>
              <Input
                id="reviewedByDesignation"
                {...register('analysisEvaluation.reviewedBy.designation')}
                placeholder="Enter reviewer designation"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="reviewedByDate">Date</Label>
              <Input
                id="reviewedByDate"
                type="date"
                {...register('analysisEvaluation.reviewedBy.date')}
              />
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

'use client';

import { useState } from 'react';
import { useFormContext, useWatch } from 'react-hook-form';
import { toast } from 'sonner';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { DatePicker } from '@/components/ui/date-picker';
import {
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from '@/components/ui/form';
import { Sparkles, Loader2, Brain, CheckCircle, FileText, UserCheck } from 'lucide-react';
import type { PSIRFormData } from '@/types/psir';
import { cn } from '@/lib/utils';

type ToneSuggestion = 'Objective' | 'Empathetic' | 'Firm';

export function SectionIV_Analysis() {
  const { control, watch, setValue } = useFormContext<PSIRFormData>();
  const [selectedTone, setSelectedTone] = useState<ToneSuggestion>('Objective');
  const [manualPrompt, setManualPrompt] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);

  // Watch form values for AI context
  const identifyingData = useWatch({ control, name: 'identifyingData' });
  const criminalHistory = useWatch({ control, name: 'criminalHistory' });
  const socioEconomicBackground = useWatch({ control, name: 'socioEconomicBackground' });

  // Watch the circumstances field for character count
  const circumstances = watch('analysisEvaluation.circumstances') || '';
  const totalChars = circumstances.length;
  const maxChars = 5000;

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
    <Card className="shadow-none border border-border bg-card/50">
      <CardHeader className="pb-6 border-b bg-card/80">
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-[var(--brand-primary)] px-2 py-0.5 rounded border border-[var(--brand-primary)]/20 bg-[var(--brand-primary)]/5">Section IV</span>
              <h2 className="text-2xl font-bold tracking-tight text-foreground">Analysis & Evaluation</h2>
            </div>
            <p className="text-sm text-muted-foreground">Synthesis of findings and final recommendations.</p>
          </div>
          <div className="hidden sm:block">
             <Brain className="h-8 w-8 text-muted-foreground/10" />
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-12 pt-8">
        {/* Main Assessment Workspace */}
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-border/50">
            <div className="flex items-center gap-2">
              <FileText className="h-4 w-4 text-[var(--brand-primary)]" />
              <h3 className="text-sm font-bold uppercase tracking-wider text-foreground/80">Assessment Workspace</h3>
            </div>
            
            <div className="flex flex-wrap items-center gap-3">
              <div className="flex bg-muted/50 p-0.5 rounded-md border">
                {(['Objective', 'Empathetic', 'Firm'] as ToneSuggestion[]).map((tone) => (
                  <button
                    key={tone}
                    type="button"
                    onClick={() => setSelectedTone(tone)}
                    className={cn(
                      "px-3 py-1 text-[10px] font-bold uppercase tracking-wider rounded transition-all",
                      selectedTone === tone
                        ? "bg-background text-[var(--brand-primary)] shadow-sm"
                        : "text-muted-foreground hover:text-foreground"
                    )}
                  >
                    {tone}
                  </button>
                ))}
              </div>
              
              <Button
                type="button"
                size="sm"
                className="bg-purple-600 hover:bg-purple-700 text-white shadow-sm gap-2"
                onClick={generateRecommendations}
                disabled={isGenerating}
              >
                {isGenerating ? (
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                ) : (
                  <Sparkles className="h-3.5 w-3.5" />
                )}
                <span className="text-xs font-bold uppercase tracking-wider">Draft with AI</span>
              </Button>
            </div>
          </div>

          <div className="space-y-6 pl-0 sm:pl-4 border-l-2 border-transparent sm:border-[var(--brand-primary)]/10">
            <div className="space-y-2">
              <FormLabel className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Contextual Prompt (Optional)</FormLabel>
              <Textarea
                value={manualPrompt}
                onChange={(e) => setManualPrompt(e.target.value)}
                placeholder="Direct the AI focus (e.g., 'Emphasize restorative justice')"
                rows={2}
                className="resize-none bg-background shadow-none focus-visible:ring-1 text-sm border-dashed"
              />
            </div>

            <FormField
              control={control}
              name="analysisEvaluation.circumstances"
              render={({ field }) => (
                <FormItem className="space-y-2">
                  <div className="flex items-center justify-between">
                    <FormLabel className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Synthesis & Circumstances</FormLabel>
                    <span className={cn("text-[10px] font-mono", totalChars > maxChars ? "text-destructive" : "text-muted-foreground")}>
                      {totalChars.toLocaleString()} / {maxChars.toLocaleString()}
                    </span>
                  </div>
                  <FormControl>
                    <Textarea
                      {...field}
                      placeholder="Synthesize your findings and provide a comprehensive evaluation..."
                      rows={18}
                      className="resize-none font-mono text-sm leading-relaxed bg-background shadow-none focus-visible:ring-1"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </div>

        {/* Probation & Community Service */}
        <div className="space-y-6">
          <div className="flex items-center gap-2 pb-2 border-b border-border/50">
            <CheckCircle className="h-4 w-4 text-[var(--brand-primary)]" />
            <h3 className="text-sm font-bold uppercase tracking-wider text-foreground/80">Duration & Conditions</h3>
          </div>
          
          <div className="grid gap-8 md:grid-cols-2 pl-0 sm:pl-4 border-l-2 border-transparent sm:border-[var(--brand-primary)]/10">
            <FormField
              control={control}
              name="analysisEvaluation.probationPeriod"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Recommended Probation Period</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g., THREE (3) YEARS, SIX (6) MONTHS" {...field} className="bg-background shadow-none focus-visible:ring-1" />
                  </FormControl>
                  <p className="text-[10px] text-muted-foreground">Specify the exact duration for the probation.</p>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="grid gap-6">
               <FormField
                control={control}
                name="analysisEvaluation.communityServiceHours"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Community Service Hours</FormLabel>
                    <FormControl>
                      <Input 
                        type="text" 
                        placeholder="e.g., Forty (40) hours" 
                        {...field} 
                        onChange={(e) => field.onChange(e.target.value)}
                        className="bg-background shadow-none focus-visible:ring-1" 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={control}
                name="analysisEvaluation.communityServiceType"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Service Specifics (e.g., Tree Planting)</FormLabel>
                    <FormControl>
                      <Textarea 
                        placeholder="e.g., Fifty (50)" 
                        rows={2}
                        {...field} 
                        className="resize-none bg-background shadow-none focus-visible:ring-1" 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </div>
        </div>

        {/* Accountability & Approval */}
        <div className="space-y-6">
          <div className="flex items-center gap-2 pb-2 border-b border-border/50">
            <UserCheck className="h-4 w-4 text-[var(--brand-primary)]" />
            <h3 className="text-sm font-bold uppercase tracking-wider text-foreground/80">Accountability & Approval</h3>
          </div>
          
          <div className="space-y-8 pl-0 sm:pl-4 border-l-2 border-transparent sm:border-[var(--brand-primary)]/10">
            <div className="grid gap-6 md:grid-cols-3">
              <FormField
                control={control}
                name="analysisEvaluation.preparedBy.name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Prepared By (Name)</FormLabel>
                    <FormControl>
                      <Input placeholder="Full Name" {...field} className="bg-background shadow-none focus-visible:ring-1 font-bold" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={control}
                name="analysisEvaluation.preparedBy.designation"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Designation</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., Senior Probation Officer" {...field} className="bg-background shadow-none focus-visible:ring-1 italic" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={control}
                name="analysisEvaluation.preparedBy.date"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Date Prepared</FormLabel>
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

            {/* Reviewed By Section */}
            <div className="grid gap-6 md:grid-cols-3 mt-8">
              <FormField
                control={control}
                name="analysisEvaluation.reviewedBy.name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Reviewed By (Name)</FormLabel>
                    <FormControl>
                      <Input placeholder="Full Name" {...field} className="bg-background shadow-none focus-visible:ring-1 font-bold" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={control}
                name="analysisEvaluation.reviewedBy.designation"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Designation</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., Chief Probation Officer" {...field} className="bg-background shadow-none focus-visible:ring-1 italic" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={control}
                name="analysisEvaluation.reviewedBy.date"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Date Reviewed</FormLabel>
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
        </div>
      </CardContent>
    </Card>
  );
}

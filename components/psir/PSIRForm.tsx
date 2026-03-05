'use client';

import { useState, useEffect, useCallback } from 'react';
import { useForm, FormProvider, Resolver, FieldErrors } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Save, ChevronLeft, ChevronRight, Check, Loader2, FileText, LayoutDashboard } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { FormNavigation } from './FormNavigation';
import { SectionI_IdentifyingData } from './SectionI_IdentifyingData';
import { SectionII_CriminalHistory } from './SectionII_CriminalHistory';
import { SectionIII_SocioEconomic } from './SectionIII_SocioEconomic';
import { SectionIV_Analysis } from './SectionIV_Analysis';
import { AutoSaveIndicator } from './AutoSaveIndicator';
import { psirFormSchema } from '@/lib/validations/psir-schema';
import { defaultFormValues, generateReportNumber } from '@/lib/utils/form-helpers';
import type { PSIRFormData } from '@/types/psir';
import { cn } from '@/lib/utils';
import Link from 'next/link';

const sectionFieldPaths: Record<number, (keyof PSIRFormData)[]> = {
  1: ['identifyingData'],
  2: ['criminalHistory'],
  3: ['socioEconomicBackground'],
  4: ['analysisEvaluation'],
};

const sectionNames: Record<number, string> = {
  1: 'Identifying Data',
  2: 'Criminal History',
  3: 'Socio-Economic Background',
  4: 'Analysis and Evaluation',
};

function getValidationErrors(errors: FieldErrors<PSIRFormData>): string[] {
  const messages: string[] = [];
  const extractErrors = (obj: Record<string, unknown>, prefix = '') => {
    for (const key in obj) {
      const value = obj[key] as Record<string, unknown>;
      if (value?.message && typeof value.message === 'string') {
        messages.push(value.message);
      } else if (typeof value === 'object' && value !== null) {
        extractErrors(value as Record<string, unknown>, `${prefix}${key}.`);
      }
    }
  };
  extractErrors(errors as Record<string, unknown>);
  return messages;
}

interface PSIRFormProps {
  initialData?: Partial<PSIRFormData>;
  reportId?: string;
  onSave?: (data: PSIRFormData, status: 'draft' | 'completed') => Promise<void>;
}

export function PSIRForm({ initialData, reportId, onSave }: PSIRFormProps) {
  const [currentSection, setCurrentSection] = useState(1);
  const [isSaving, setIsSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [saveError, setSaveError] = useState<string | null>(null);

  const methods = useForm<PSIRFormData>({
    resolver: zodResolver(psirFormSchema) as Resolver<PSIRFormData>,
    defaultValues: {
      ...defaultFormValues,
      reportNumber: initialData?.reportNumber || generateReportNumber(),
      ...initialData,
    } as PSIRFormData,
  });

  const { handleSubmit, watch, trigger, formState: { isDirty, errors } } = methods;

  const autoSave = useCallback(async () => {
    if (!isDirty || !onSave) return;
    setIsSaving(true);
    setSaveError(null);
    try {
      const data = methods.getValues();
      await onSave(data, 'draft');
      setLastSaved(new Date());
    } catch (error) {
      setSaveError('Failed to auto-save');
      console.error('Auto-save error:', error);
    } finally {
      setIsSaving(false);
    }
  }, [isDirty, methods, onSave]);

  useEffect(() => {
    const interval = setInterval(autoSave, 30000);
    return () => clearInterval(interval);
  }, [autoSave]);

  const handleSaveDraft = async () => {
    if (!onSave) return;
    setIsSaving(true);
    setSaveError(null);
    try {
      const data = methods.getValues();
      await onSave(data, 'draft');
      setLastSaved(new Date());
      toast.success('Draft saved');
    } catch (error) {
      setSaveError('Failed to save draft');
      toast.error('Failed to save draft');
    } finally {
      setIsSaving(false);
    }
  };

  const onSubmit = async (data: PSIRFormData) => {
    if (!onSave) return;
    setIsSaving(true);
    try {
      await onSave(data, 'draft');
      setLastSaved(new Date());
      toast.success('Report saved as draft');
    } catch (error) {
      toast.error('Failed to save draft');
    } finally {
      setIsSaving(false);
    }
  };

  const validateSection = async (sectionNumber: number): Promise<boolean> => {
    const fieldsToValidate = sectionFieldPaths[sectionNumber];
    const isValid = await trigger(fieldsToValidate);
    if (!isValid) {
      toast.error(`Please complete Section ${sectionNumber}`);
    }
    return isValid;
  };

  const handleNext = async () => {
    if (currentSection < 4) {
      const isValid = await validateSection(currentSection);
      if (isValid) {
        setCurrentSection(currentSection + 1);
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    }
  };

  const handlePrevious = () => {
    if (currentSection > 1) {
      setCurrentSection(currentSection - 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  return (
    <FormProvider {...methods}>
      <div className="flex min-h-screen bg-[#f8f9fa]">
        
        {/* Fixed Professional Sidebar */}
        <aside className="hidden lg:flex flex-col w-[280px] bg-white border-r border-border fixed h-screen overflow-y-auto px-6 py-8 z-20">
          <div className="space-y-8">
            <div className="space-y-4">
              <Link href="/dashboard" className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors group">
                <LayoutDashboard className="h-4 w-4 group-hover:scale-110 transition-transform" />
                <span className="text-xs font-bold uppercase tracking-widest">Dashboard</span>
              </Link>
              
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <FileText className="h-5 w-5 text-[var(--brand-primary)]" />
                  <h1 className="text-sm font-bold tracking-tight">PSIR Workspace</h1>
                </div>
                <div className="font-mono text-[10px] text-muted-foreground bg-muted px-2 py-1 rounded inline-block">
                  {watch('reportNumber')}
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <h2 className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest px-4">Navigation</h2>
              <FormNavigation
                currentSection={currentSection}
                onSectionChange={setCurrentSection}
                onValidateSection={async (from) => validateSection(from)}
              />
            </div>

            <div className="pt-8 mt-8 border-t border-border/50 space-y-4 px-4">
              <AutoSaveIndicator
                isSaving={isSaving}
                lastSaved={lastSaved}
                error={saveError}
              />
              
              <Button
                type="button"
                variant="outline"
                className="w-full justify-start gap-2 h-9 border-dashed"
                onClick={handleSaveDraft}
                disabled={isSaving}
              >
                {isSaving ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Save className="h-3.5 w-3.5" />}
                <span className="text-xs font-bold uppercase tracking-wider">Save Progress</span>
              </Button>
            </div>
          </div>
        </aside>

        {/* Main Workspace Area */}
        <main className="flex-1 lg:ml-[280px] flex flex-col pb-24">
          
          {/* Top Bar (Mobile Only or Secondary Context) */}
          <header className="lg:hidden sticky top-0 z-30 bg-white/95 backdrop-blur border-b px-4 py-3 flex items-center justify-between">
             <div className="flex items-center gap-2">
                <FileText className="h-4 w-4 text-[var(--brand-primary)]" />
                <span className="text-xs font-bold tracking-tight">{watch('reportNumber')}</span>
             </div>
             <AutoSaveIndicator isSaving={isSaving} lastSaved={lastSaved} />
          </header>

          <div className="container max-w-4xl mx-auto py-8 px-4 lg:px-12">
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
              <div className="page-transition">
                {currentSection === 1 && <SectionI_IdentifyingData />}
                {currentSection === 2 && <SectionII_CriminalHistory />}
                {currentSection === 3 && <SectionIII_SocioEconomic />}
                {currentSection === 4 && <SectionIV_Analysis />}
              </div>

              {/* Bottom Contextual Navigation */}
              <div className="flex items-center justify-between pt-8 border-t border-border/50">
                <Button
                  type="button"
                  variant="ghost"
                  onClick={handlePrevious}
                  disabled={currentSection === 1}
                  className="gap-2 h-10 px-4 text-muted-foreground hover:text-foreground"
                >
                  <ChevronLeft className="h-4 w-4" />
                  <span className="text-sm font-bold uppercase tracking-wider">Previous</span>
                </Button>

                <div className="flex items-center gap-3">
                  {currentSection < 4 ? (
                    <Button
                      type="button"
                      onClick={handleNext}
                      className="bg-[var(--brand-primary)] text-white hover:bg-[var(--brand-primary)]/90 px-8 h-10 shadow-lg shadow-[var(--brand-primary)]/10 group"
                    >
                      <span className="text-sm font-bold uppercase tracking-wider">Next Section</span>
                      <ChevronRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                    </Button>
                  ) : (
                    <Button 
                      type="submit" 
                      disabled={isSaving} 
                      className="bg-[var(--brand-primary)] hover:bg-[var(--brand-primary)]/90 text-white px-8 h-10 shadow-lg shadow-[var(--brand-primary)]/10"
                    >
                      {isSaving ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Save className="h-4 w-4 mr-2" />}
                      <span className="text-sm font-bold uppercase tracking-wider">Save Draft</span>
                    </Button>
                  )}
                </div>
              </div>
            </form>
          </div>
        </main>
      </div>
    </FormProvider>
  );
}

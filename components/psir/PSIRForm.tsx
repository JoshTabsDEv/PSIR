'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useForm, FormProvider, Resolver, FieldErrors } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Save, ChevronLeft, ChevronRight, Loader2, FileText, LayoutDashboard } from 'lucide-react';
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
import Link from 'next/link';

const sectionFieldPaths: Record<number, (keyof PSIRFormData)[]> = {
  1: ['identifyingData'],
  2: ['criminalHistory'],
  3: ['socioEconomicBackground'],
  4: ['analysisEvaluation'],
};

interface PSIRFormProps {
  initialData?: Partial<PSIRFormData>;
  reportId?: string;
  onSave?: (data: PSIRFormData, status: 'draft' | 'completed') => Promise<string | void>;
}

export function PSIRForm({ initialData, reportId, onSave }: PSIRFormProps) {
  const router = useRouter();
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

  const { handleSubmit, watch, trigger, formState: { isDirty } } = methods;

  // --- Unified Save Logic ---
  
  const handleSaveDraft = useCallback(async (data?: PSIRFormData) => {
    if (!onSave) return;
    
    const formData = data || methods.getValues();
    
    // Validate the current section before saving
    const isValid = await trigger(sectionFieldPaths[currentSection]);
    if (!isValid) {
      toast.error('Please fix validation errors before saving');
      return;
    }

    setIsSaving(true);
    setSaveError(null);
    try {
      const savedId = await onSave(formData, 'draft');
      setLastSaved(new Date());
      return savedId;
    } catch (error) {
      setSaveError('Failed to save');
      toast.error('Failed to save progress');
      throw error;
    } finally {
      setIsSaving(false);
    }
  }, [onSave, methods, trigger, currentSection]);

  // Form Submission (Final Step)
  const onSubmit = async (data: PSIRFormData) => {
    try {
      const savedId = await handleSaveDraft(data);
      toast.success('Report saved successfully');
      const redirectId = savedId || reportId;
      if (redirectId) {
        router.push(`/dashboard/reports/${redirectId}`);
      }
    } catch (error) {
      // Error handled in handleSaveDraft
    }
  };

  // Auto-save logic (only runs if not on the final section to avoid unexpected jumps)
  useEffect(() => {
    if (currentSection === 4 || !isDirty) return;

    const timer = setTimeout(async () => {
      const isValid = await trigger(sectionFieldPaths[currentSection]);
      if (isValid) {
        handleSaveDraft();
      }
    }, 30000);

    return () => clearTimeout(timer);
  }, [isDirty, currentSection, trigger, handleSaveDraft]);

  // --- Navigation Logic ---

  const validateSection = async (sectionNumber: number): Promise<boolean> => {
    const fieldsToValidate = sectionFieldPaths[sectionNumber];
    const isValid = await trigger(fieldsToValidate);
    if (!isValid) {
      toast.error(`Please complete Section ${sectionNumber} correctly.`);
    }
    return isValid;
  };

  const handleNext = async () => {
    if (currentSection < 4) {
      const isValid = await validateSection(currentSection);
      if (isValid) {
        // Optional: Save on section transition
        await handleSaveDraft();
        setCurrentSection(prev => prev + 1);
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    }
  };

  const handlePrevious = () => {
    if (currentSection > 1) {
      setCurrentSection(prev => prev - 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  return (
    <FormProvider {...methods}>
      <div className="flex min-h-screen bg-[#f8f9fa]">
        {/* Sidebar */}
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
              <FormNavigation
                currentSection={currentSection}
                onSectionChange={setCurrentSection}
                onValidateSection={validateSection}
                allowNextSectionNavigation={false}
              />
            </div>

            <div className="pt-8 mt-8 border-t border-border/50 space-y-4 px-4">
              <AutoSaveIndicator isSaving={isSaving} lastSaved={lastSaved} error={saveError} />
              <Button
                type="button"
                variant="outline"
                className="w-full justify-start gap-2 h-9 border-dashed"
                onClick={() => handleSaveDraft()}
                disabled={isSaving}
              >
                {isSaving ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Save className="h-3.5 w-3.5" />}
                <span className="text-xs font-bold uppercase tracking-wider">Save Progress</span>
              </Button>
            </div>
          </div>
        </aside>

        <main className="flex-1 lg:ml-[280px] flex flex-col pb-24">
          <header className="lg:hidden sticky top-0 z-30 bg-white/95 backdrop-blur border-b px-4 py-3 flex items-center justify-between">
             <div className="flex items-center gap-2">
                <FileText className="h-4 w-4 text-[var(--brand-primary)]" />
                <span className="text-xs font-bold tracking-tight">{watch('reportNumber')}</span>
             </div>
             <AutoSaveIndicator isSaving={isSaving} lastSaved={lastSaved} error={saveError} />
          </header>

          <div className="container max-w-4xl mx-auto py-8 px-4 lg:px-12">
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
              <div className="page-transition">
                {currentSection === 1 && <SectionI_IdentifyingData />}
                {currentSection === 2 && <SectionII_CriminalHistory />}
                {currentSection === 3 && <SectionIII_SocioEconomic />}
                {currentSection === 4 && <SectionIV_Analysis />}
              </div>

              <div className="flex items-center justify-between pt-8 border-t border-border/50">
                <Button
                  type="button"
                  variant="ghost"
                  onClick={handlePrevious}
                  disabled={currentSection === 1}
                  className="gap-2 h-10 px-4 text-muted-foreground"
                >
                  <ChevronLeft className="h-4 w-4" />
                  <span className="text-sm font-bold uppercase tracking-wider">Previous</span>
                </Button>

                <div className="flex items-center gap-3">
                  {currentSection < 4 ? (
                    <Button
                      type="button"
                      onClick={handleNext}
                      className="bg-[var(--brand-primary)] hover:bg-[var(--brand-primary)]/90 text-white px-8 h-10 shadow-lg"
                    >
                      <span className="text-sm font-bold uppercase tracking-wider">Next Section</span>
                      <ChevronRight className="ml-2 h-4 w-4" />
                    </Button>
                  ) : (
                    <Button 
                      type="submit" 
                      disabled={isSaving} 
                      className="bg-[var(--brand-primary)] hover:bg-[var(--brand-primary)]/90 text-white px-8 h-10 shadow-lg"
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
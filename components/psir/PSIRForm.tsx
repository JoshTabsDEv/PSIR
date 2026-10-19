'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useForm, FormProvider } from 'react-hook-form';
import { Save, ChevronLeft, ChevronRight, Loader2, FileText, LayoutDashboard } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { FormNavigation } from './FormNavigation';
import { SectionI_IdentifyingData } from './SectionI_IdentifyingData';
import { SectionII_CriminalHistory } from './SectionII_CriminalHistory';
import { SectionIII_SocioEconomic } from './SectionIII_SocioEconomic';
import { SectionIV_Analysis } from './SectionIV_Analysis';
import { AutoSaveIndicator } from './AutoSaveIndicator';
import { defaultFormValues } from '@/lib/utils/form-helpers';
import type { PSIRFormData } from '@/types/psir';
import { judgeNameStore, normalizeJudgeName, dedupeAndSortJudgeNames } from '@/lib/judge-name-store';
import Link from 'next/link';

/** Result of a save. New reports return the server-assigned report number. */
export interface SaveResult {
  id: string;
  reportNumber?: string;
}

interface PSIRFormProps {
  initialData?: Partial<PSIRFormData>;
  reportId?: string;
  onSave?: (data: PSIRFormData, status: 'draft' | 'completed') => Promise<string | SaveResult | void>;
}

interface AnalysisFieldOptions {
  probationPeriods: string[];
  communityServiceValues: string[];
  preparedByNames: string[];
  reviewedByNames: string[];
}

export function PSIRForm({ initialData, reportId, onSave }: PSIRFormProps) {
  const router = useRouter();
  const [currentSection, setCurrentSection] = useState(1);
  const [isSaving, setIsSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [judgeNames, setJudgeNames] = useState<string[]>([]);
  const [judgeInputMode, setJudgeInputMode] = useState<'manual' | 'existing'>('manual');
  const [analysisFieldOptions, setAnalysisFieldOptions] = useState<AnalysisFieldOptions>({
    probationPeriods: [],
    communityServiceValues: [],
    preparedByNames: [],
    reviewedByNames: [],
  });

  const methods = useForm<PSIRFormData>({
    defaultValues: {
      ...defaultFormValues,
      // Assigned by the server on first save (per office, per year)
      reportNumber: initialData?.reportNumber || '',
      ...initialData,
    } as PSIRFormData,
  });

  const {
    watch,
    setValue,
    getValues,
    formState: { isDirty },
  } = methods;

  const persistJudgeName = useCallback(async (rawJudgeName: string) => {
    const normalizedJudgeName = normalizeJudgeName(rawJudgeName || '');
    if (!normalizedJudgeName) return;

    try {
      const state = judgeNameStore.save(normalizedJudgeName);
      setJudgeNames((currentJudgeNames) =>
        dedupeAndSortJudgeNames([...currentJudgeNames, ...state.judgeNames])
      );
    } catch (error) {
      console.error('Failed to persist judge name:', error);
    }
  }, []);

  const fetchAnalysisFieldOptions = useCallback(async () => {
    try {
      const response = await fetch('/api/reports/field-options');
      const result = await response.json();

      if (!response.ok || !result.success || !result.data) {
        throw new Error(result.error || 'Failed to load report field options');
      }

      setAnalysisFieldOptions({
        probationPeriods: Array.isArray(result.data.probationPeriods) ? result.data.probationPeriods : [],
        communityServiceValues: Array.isArray(result.data.communityServiceValues) ? result.data.communityServiceValues : [],
        preparedByNames: Array.isArray(result.data.preparedByNames) ? result.data.preparedByNames : [],
        reviewedByNames: Array.isArray(result.data.reviewedByNames) ? result.data.reviewedByNames : [],
      });
    } catch (error) {
      console.error('Failed to preload report field options:', error);
    }
  }, []);

  useEffect(() => {
    let isMounted = true;

    async function preloadJudgeNames() {
      const judgeNameStatePromise = Promise.resolve(judgeNameStore.getState());
      const databaseJudgeNamesPromise = fetch('/api/judge-names')
        .then(async (response) => {
          const result = await response.json();
          if (!response.ok || !result.success || !Array.isArray(result.data)) {
            throw new Error(result.error || 'Failed to load judge names');
          }
          return result.data as string[];
        })
        .catch((error) => {
          console.error('Failed to load judge names from reports:', error);
          return [] as string[];
        });

      try {
        const [judgeNameState, databaseJudgeNames] = await Promise.all([
          judgeNameStatePromise,
          databaseJudgeNamesPromise,
        ]);

        const mergedJudgeNames = dedupeAndSortJudgeNames([
          ...judgeNameState.judgeNames,
          ...databaseJudgeNames,
        ]);
        const currentJudgeName = getValues('identifyingData.letterJudge');

        if (!isMounted) return;

        setJudgeNames(mergedJudgeNames);

        if (currentJudgeName) {
          setJudgeInputMode('manual');
        } else if (judgeNameState.recentJudge) {
          setValue('identifyingData.letterJudge', judgeNameState.recentJudge, {
            shouldDirty: false,
            shouldTouch: false,
            shouldValidate: false,
          });
        }
      } catch (error) {
        console.error('Failed to preload judge names:', error);
      }
    }

    preloadJudgeNames();
    void fetchAnalysisFieldOptions();

    return () => {
      isMounted = false;
    };
  }, [fetchAnalysisFieldOptions, getValues, setValue]);

  // --- Unified Save Logic ---
  
  const handleSaveDraft = useCallback(async (data?: PSIRFormData) => {
    if (!onSave) return;
    
    const formData = data || methods.getValues();
    const normalizedJudgeName = normalizeJudgeName(formData.identifyingData.letterJudge || '');
    if (normalizedJudgeName && normalizedJudgeName !== formData.identifyingData.letterJudge) {
      formData.identifyingData.letterJudge = normalizedJudgeName;
      setValue('identifyingData.letterJudge', normalizedJudgeName, {
        shouldDirty: true,
        shouldTouch: true,
        shouldValidate: false,
      });
    }

    await persistJudgeName(normalizedJudgeName);

    setIsSaving(true);
    setSaveError(null);
    try {
      const saved = await onSave(formData, 'draft');
      const savedId = typeof saved === 'string' ? saved : saved?.id;
      const assignedNumber = typeof saved === 'object' ? saved?.reportNumber : undefined;
      if (assignedNumber && assignedNumber !== getValues('reportNumber')) {
        setValue('reportNumber', assignedNumber, { shouldDirty: false, shouldTouch: false, shouldValidate: false });
      }
      setLastSaved(new Date());
      await fetchAnalysisFieldOptions();
      return savedId;
    } catch (error) {
      setSaveError('Failed to save');
      toast.error('Failed to save progress');
      throw error;
    } finally {
      setIsSaving(false);
    }
  }, [fetchAnalysisFieldOptions, getValues, onSave, methods, persistJudgeName, setValue]);

  // Form Submission (Final Step)
  const onSubmit = async () => {
    try {
      const savedId = await handleSaveDraft();
      toast.success('Report saved successfully');
      const redirectId = savedId || reportId;
      if (redirectId) {
        router.push(`/dashboard/reports/${redirectId}`);
      }
    } catch {
      // Error handled in handleSaveDraft
    }
  };

  // Auto-save logic (only runs if not on the final section to avoid unexpected jumps)
  useEffect(() => {
    if (currentSection === 4 || !isDirty) return;

    const timer = setTimeout(async () => {
      handleSaveDraft();
    }, 30000);

    return () => clearTimeout(timer);
  }, [isDirty, currentSection, handleSaveDraft]);

  // --- Navigation Logic ---

  const handleNext = async () => {
    if (currentSection < 4) {
      await handleSaveDraft();
      setCurrentSection(prev => prev + 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
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
                  {watch('reportNumber') || 'Number assigned on first save'}
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <FormNavigation
                currentSection={currentSection}
                onSectionChange={setCurrentSection}
                allowNextSectionNavigation
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
                <span className="text-xs font-bold tracking-tight">{watch('reportNumber') || 'New report'}</span>
             </div>
             <AutoSaveIndicator isSaving={isSaving} lastSaved={lastSaved} error={saveError} />
          </header>

          <div className="container max-w-4xl mx-auto py-8 px-4 lg:px-12">
            <form
              onSubmit={(event) => {
                event.preventDefault();
                void onSubmit();
              }}
              className="space-y-8"
            >
              <div className="page-transition">
                {currentSection === 1 && (
                  <SectionI_IdentifyingData
                    judgeNames={judgeNames}
                    judgeInputMode={judgeInputMode}
                    onJudgeInputModeChange={setJudgeInputMode}
                    onJudgeNamesChange={setJudgeNames}
                    onJudgeNameCommit={persistJudgeName}
                  />
                )}
                {currentSection === 2 && <SectionII_CriminalHistory />}
                {currentSection === 3 && <SectionIII_SocioEconomic />}
                {currentSection === 4 && (
                  <SectionIV_Analysis
                    probationPeriodOptions={analysisFieldOptions.probationPeriods}
                    communityServiceOptions={analysisFieldOptions.communityServiceValues}
                    preparedByOptions={analysisFieldOptions.preparedByNames}
                    reviewedByOptions={analysisFieldOptions.reviewedByNames}
                  />
                )}
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

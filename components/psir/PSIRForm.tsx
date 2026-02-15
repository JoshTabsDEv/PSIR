'use client';

import { useState, useEffect, useCallback } from 'react';
import { useForm, FormProvider, Resolver, FieldErrors } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Save, ChevronLeft, ChevronRight, Check, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { FormNavigation } from './FormNavigation';
import { SectionI_IdentifyingData } from './SectionI_IdentifyingData';
import { SectionII_CriminalHistory } from './SectionII_CriminalHistory';
import { SectionIII_SocioEconomic } from './SectionIII_SocioEconomic';
import { SectionIV_Analysis } from './SectionIV_Analysis';
import { AutoSaveIndicator } from './AutoSaveIndicator';
import { psirFormSchema, sectionSchemas } from '@/lib/validations/psir-schema';
import { defaultFormValues, generateReportNumber } from '@/lib/utils/form-helpers';
import type { PSIRFormData } from '@/types/psir';

// Map section numbers to their field paths for validation
const sectionFieldPaths: Record<number, (keyof PSIRFormData)[]> = {
  1: ['identifyingData'],
  2: ['criminalHistory'],
  3: ['socioEconomicBackground'],
  4: ['analysisEvaluation'],
};

// Section names for error messages
const sectionNames: Record<number, string> = {
  1: 'Identifying Data',
  2: 'Criminal History',
  3: 'Socio-Economic Background',
  4: 'Analysis and Evaluation',
};

// Helper to extract validation error messages
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

  // Auto-save functionality
  const autoSave = useCallback(async () => {
    if (!isDirty || !onSave) return;

    setIsSaving(true);
    setSaveError(null);

    try {
      const data = methods.getValues();
      await onSave(data, 'draft');
      setLastSaved(new Date());
      toast.success('Auto-saved', {
        description: 'Your changes have been saved automatically.',
        duration: 2000,
      });
    } catch (error) {
      setSaveError('Failed to auto-save');
      toast.error('Auto-save failed', {
        description: 'Could not save your changes. Please try saving manually.',
      });
      console.error('Auto-save error:', error);
    } finally {
      setIsSaving(false);
    }
  }, [isDirty, methods, onSave]);

  // Auto-save every 30 seconds
  useEffect(() => {
    const interval = setInterval(autoSave, 30000);
    return () => clearInterval(interval);
  }, [autoSave]);

  // Save draft manually
  const handleSaveDraft = async () => {
    if (!onSave) return;

    setIsSaving(true);
    setSaveError(null);

    try {
      const data = methods.getValues();
      await onSave(data, 'draft');
      setLastSaved(new Date());
      toast.success('Draft saved', {
        description: 'Your report has been saved as a draft.',
      });
    } catch (error) {
      setSaveError('Failed to save draft');
      toast.error('Failed to save draft', {
        description: 'An error occurred while saving. Please try again.',
      });
      console.error('Save draft error:', error);
    } finally {
      setIsSaving(false);
    }
  };

  // Submit completed form
  const onSubmit = async (data: PSIRFormData) => {
    if (!onSave) return;

    setIsSaving(true);
    setSaveError(null);

    try {
      await onSave(data, 'completed');
      setLastSaved(new Date());
      toast.success('Report submitted', {
        description: 'Your PSIR report has been completed successfully.',
      });
    } catch (error) {
      setSaveError('Failed to submit report');
      toast.error('Failed to submit report', {
        description: 'An error occurred while submitting. Please try again.',
      });
      console.error('Submit error:', error);
    } finally {
      setIsSaving(false);
    }
  };

  // Handle validation errors
  const onError = (errors: FieldErrors<PSIRFormData>) => {
    const errorMessages = getValidationErrors(errors);

    if (errorMessages.length > 0) {
      toast.error('Validation Error', {
        description: (
          <ul className="list-disc pl-4 mt-2 space-y-1">
            {errorMessages.slice(0, 5).map((msg, i) => (
              <li key={i} className="text-sm">{msg}</li>
            ))}
            {errorMessages.length > 5 && (
              <li className="text-sm text-gray-500">
                ...and {errorMessages.length - 5} more errors
              </li>
            )}
          </ul>
        ),
        duration: 5000,
      });
    }
  };

  const renderSection = () => {
    switch (currentSection) {
      case 1:
        return <SectionI_IdentifyingData />;
      case 2:
        return <SectionII_CriminalHistory />;
      case 3:
        return <SectionIII_SocioEconomic />;
      case 4:
        return <SectionIV_Analysis />;
      default:
        return <SectionI_IdentifyingData />;
    }
  };

  const handlePrevious = () => {
    if (currentSection > 1) {
      setCurrentSection(currentSection - 1);
    }
  };

  // Validate a specific section and show errors
  const validateSection = async (sectionNumber: number): Promise<boolean> => {
    const fieldsToValidate = sectionFieldPaths[sectionNumber];
    const isValid = await trigger(fieldsToValidate);

    if (!isValid) {
      // Get errors for the section
      const sectionErrors = fieldsToValidate.reduce<string[]>((acc, field) => {
        const fieldErrors = errors[field];
        if (fieldErrors) {
          const errorMessages = getValidationErrors({ [field]: fieldErrors } as FieldErrors<PSIRFormData>);
          acc.push(...errorMessages);
        }
        return acc;
      }, []);

      toast.error(`Please complete Section ${sectionNumber}: ${sectionNames[sectionNumber]}`, {
        description: sectionErrors.length > 0 ? (
          <ul className="list-disc pl-4 mt-2 space-y-1">
            {sectionErrors.slice(0, 5).map((msg, i) => (
              <li key={i} className="text-sm">{msg}</li>
            ))}
            {sectionErrors.length > 5 && (
              <li className="text-sm text-gray-500">
                ...and {sectionErrors.length - 5} more errors
              </li>
            )}
          </ul>
        ) : 'Please fill in all required fields before proceeding.',
        duration: 5000,
      });
    }

    return isValid;
  };

  // Handle section navigation validation (for FormNavigation clicks)
  const handleValidateSection = async (fromSection: number): Promise<boolean> => {
    return validateSection(fromSection);
  };

  const handleNext = async () => {
    if (currentSection < 4) {
      const isValid = await validateSection(currentSection);
      if (isValid) {
        setCurrentSection(currentSection + 1);
      }
    }
  };

  return (
    <FormProvider {...methods}>
      <form onSubmit={handleSubmit(onSubmit, onError)} className="space-y-6">
        {/* Header with report number and auto-save indicator */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-lg font-semibold">
              {reportId ? 'Edit Report' : 'New Report'}
            </h2>
            <p className="text-sm text-gray-500 font-mono">
              {watch('reportNumber')}
            </p>
          </div>
          <AutoSaveIndicator
            isSaving={isSaving}
            lastSaved={lastSaved}
            error={saveError}
          />
        </div>

        {/* Section Navigation */}
        <FormNavigation
          currentSection={currentSection}
          onSectionChange={setCurrentSection}
          onValidateSection={handleValidateSection}
        />

        {/* Current Section */}
        {renderSection()}

        {/* Navigation Buttons */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-t pt-6">
          <div className="flex gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={handlePrevious}
              disabled={currentSection === 1}
            >
              <ChevronLeft className="mr-2 h-4 w-4" />
              Previous
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={handleNext}
              disabled={currentSection === 4}
            >
              Next
              <ChevronRight className="ml-2 h-4 w-4" />
            </Button>
          </div>

          <div className="flex gap-2">
            <Button
              type="button"
              variant="secondary"
              onClick={handleSaveDraft}
              disabled={isSaving}
            >
              {isSaving ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Save className="mr-2 h-4 w-4" />
              )}
              Save Draft
            </Button>

            {currentSection === 4 && (
              <Button type="submit" disabled={isSaving}>
                {isSaving ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <Check className="mr-2 h-4 w-4" />
                )}
                Complete Report
              </Button>
            )}
          </div>
        </div>
      </form>
    </FormProvider>
  );
}

import { useState, useEffect, useCallback } from "react";

export interface FormField {
  id: string;
  type: "text" | "textarea" | "select" | "radio";
  label: string;
  placeholder?: string;
  required?: boolean;
  options?: string[];
}

export interface FormStep {
  id: string;
  title: string;
  description?: string;
  fields: FormField[];
}

export interface FormData {
  [key: string]: string;
}

const STORAGE_KEY_PREFIX = "application_form_";

export const useApplicationForm = (formId: string, steps: FormStep[]) => {
  const storageKey = `${STORAGE_KEY_PREFIX}${formId}`;
  
  const [currentStep, setCurrentStep] = useState(0);
  const [formData, setFormData] = useState<FormData>({});
  const [savedFields, setSavedFields] = useState<Set<string>>(new Set());

  // Load saved data from localStorage
  useEffect(() => {
    const saved = localStorage.getItem(storageKey);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setFormData(parsed.data || {});
        setSavedFields(new Set(Object.keys(parsed.data || {})));
        if (typeof parsed.step === "number") {
          setCurrentStep(parsed.step);
        }
      } catch (e) {
        console.error("Failed to parse saved form data");
      }
    }
  }, [storageKey]);

  // Update a single field
  const updateField = useCallback((fieldId: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [fieldId]: value,
    }));
  }, []);

  // Save a single field
  const saveField = useCallback((fieldId: string) => {
    const newSavedFields = new Set(savedFields);
    newSavedFields.add(fieldId);
    setSavedFields(newSavedFields);
    
    localStorage.setItem(storageKey, JSON.stringify({
      data: formData,
      step: currentStep,
    }));
  }, [formData, currentStep, savedFields, storageKey]);

  // Save all form data
  const saveAll = useCallback(() => {
    const allFieldIds = steps.flatMap((step) => step.fields.map((f) => f.id));
    setSavedFields(new Set(allFieldIds.filter((id) => formData[id])));
    
    localStorage.setItem(storageKey, JSON.stringify({
      data: formData,
      step: currentStep,
    }));
  }, [formData, currentStep, steps, storageKey]);

  // Clear saved data
  const clearSaved = useCallback(() => {
    localStorage.removeItem(storageKey);
    setFormData({});
    setSavedFields(new Set());
    setCurrentStep(0);
  }, [storageKey]);

  // Navigate steps
  const nextStep = useCallback(() => {
    if (currentStep < steps.length - 1) {
      setCurrentStep((prev) => prev + 1);
    }
  }, [currentStep, steps.length]);

  const prevStep = useCallback(() => {
    if (currentStep > 0) {
      setCurrentStep((prev) => prev - 1);
    }
  }, [currentStep]);

  const goToStep = useCallback((step: number) => {
    if (step >= 0 && step < steps.length) {
      setCurrentStep(step);
    }
  }, [steps.length]);

  // Check if current step is valid
  const isCurrentStepValid = useCallback(() => {
    const currentFields = steps[currentStep]?.fields || [];
    return currentFields.every((field) => {
      if (!field.required) return true;
      return formData[field.id]?.trim().length > 0;
    });
  }, [currentStep, steps, formData]);

  // Check if field is saved
  const isFieldSaved = useCallback((fieldId: string) => {
    return savedFields.has(fieldId);
  }, [savedFields]);

  return {
    currentStep,
    totalSteps: steps.length,
    formData,
    updateField,
    saveField,
    saveAll,
    clearSaved,
    nextStep,
    prevStep,
    goToStep,
    isCurrentStepValid,
    isFieldSaved,
    currentStepData: steps[currentStep],
  };
};

'use client';

import { useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import {
  Baby,
  Calendar,
  Heart,
  Clock,
  ChevronRight,
  ChevronLeft,
  Check,
  Sparkles
} from 'lucide-react';
import { APP_NAME } from '@/lib/constants';
import Image from 'next/image';

// Question types
interface OnboardingStep {
  id: string;
  question: string;
  subtitle: string;
  icon: typeof Baby;
  options: { value: string; label: string; emoji?: string }[];
  multiSelect: boolean;
}

const steps: OnboardingStep[] = [
  {
    id: 'children_count',
    question: '¿Cuántos hijos tienes?',
    subtitle: 'Esto nos ayuda a personalizar tu experiencia',
    icon: Baby,
    options: [
      { value: '1', label: 'Un hijo', emoji: '👶' },
      { value: '2', label: 'Dos hijos', emoji: '👶👶' },
      { value: '3+', label: 'Tres o más', emoji: '👨‍👩‍👧‍👦' },
    ],
    multiSelect: false,
  },
  {
    id: 'children_ages',
    question: '¿Qué edades tienen?',
    subtitle: 'Selecciona todas las que apliquen',
    icon: Calendar,
    options: [
      { value: '0-2', label: 'Bebé (0-2 años)', emoji: '🍼' },
      { value: '3-5', label: 'Preescolar (3-5 años)', emoji: '🎨' },
      { value: '6-12', label: 'Escolar (6-12 años)', emoji: '📚' },
      { value: '13+', label: 'Adolescente (13+ años)', emoji: '🎮' },
    ],
    multiSelect: true,
  },
  {
    id: 'interests',
    question: '¿Qué temas te interesan?',
    subtitle: 'Selecciona los que más te importan',
    icon: Heart,
    options: [
      { value: 'sueno', label: 'Sueño', emoji: '🌙' },
      { value: 'alimentacion', label: 'Alimentación', emoji: '🥗' },
      { value: 'conducta', label: 'Conducta', emoji: '💭' },
      { value: 'desarrollo', label: 'Desarrollo', emoji: '📈' },
      { value: 'salud', label: 'Salud', emoji: '🏥' },
      { value: 'emocional', label: 'Bienestar emocional', emoji: '💜' },
    ],
    multiSelect: true,
  },
  {
    id: 'listening_time',
    question: '¿Cuánto tiempo tienes para escuchar?',
    subtitle: 'Te recomendaremos contenido según tu disponibilidad',
    icon: Clock,
    options: [
      { value: '5min', label: '5 minutos', emoji: '⚡' },
      { value: '15min', label: '15 minutos', emoji: '☕' },
      { value: '30min+', label: '30 minutos o más', emoji: '🛋️' },
    ],
    multiSelect: false,
  },
];

export default function OnboardingPage() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string | string[]>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const step = steps[currentStep];
  const progress = ((currentStep + 1) / steps.length) * 100;

  const handleSelect = useCallback((value: string) => {
    const currentAnswer = answers[step.id];

    if (step.multiSelect) {
      const currentArray = Array.isArray(currentAnswer) ? currentAnswer : [];
      if (currentArray.includes(value)) {
        setAnswers({
          ...answers,
          [step.id]: currentArray.filter((v) => v !== value),
        });
      } else {
        setAnswers({
          ...answers,
          [step.id]: [...currentArray, value],
        });
      }
    } else {
      setAnswers({
        ...answers,
        [step.id]: value,
      });
    }
  }, [answers, step]);

  const isOptionSelected = useCallback((value: string) => {
    const answer = answers[step.id];
    if (step.multiSelect) {
      return Array.isArray(answer) && answer.includes(value);
    }
    return answer === value;
  }, [answers, step]);

  const canProceed = useCallback(() => {
    const answer = answers[step.id];
    if (step.multiSelect) {
      return Array.isArray(answer) && answer.length > 0;
    }
    return !!answer;
  }, [answers, step]);

  const handleNext = useCallback(() => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  }, [currentStep]);

  const handleBack = useCallback(() => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  }, [currentStep]);

  const handleSkip = useCallback(() => {
    // Store that user skipped onboarding
    localStorage.setItem('onboarding_skipped', 'true');
    router.push('/home');
  }, [router]);

  const handleComplete = useCallback(async () => {
    setIsSubmitting(true);

    try {
      // Store answers locally (can be synced to Supabase later)
      localStorage.setItem('onboarding_completed', 'true');
      localStorage.setItem('user_preferences', JSON.stringify(answers));

      // Redirect to home
      router.push('/home');
    } catch (error) {
      console.error('Error saving preferences:', error);
    } finally {
      setIsSubmitting(false);
    }
  }, [answers, router]);

  const Icon = step.icon;

  return (
    <div className="min-h-screen bg-gradient-warm flex flex-col">
      {/* Header */}
      <header className="flex items-center justify-between px-6 py-4">
        <div className="flex items-center gap-2">
          <div className="relative h-8 w-8">
            <Image
              src="/logo.png"
              alt={APP_NAME}
              width={32}
              height={32}
              className="object-contain"
            />
          </div>
          <span className="font-display text-lg font-semibold">{APP_NAME}</span>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={handleSkip}
          className="text-muted-foreground hover:text-foreground"
        >
          Saltar
        </Button>
      </header>

      {/* Progress bar */}
      <div className="px-6">
        <div className="h-1 w-full bg-muted rounded-full overflow-hidden">
          <div
            className="h-full bg-primary transition-all duration-500 ease-out-expo"
            style={{ width: `${progress}%` }}
          />
        </div>
        <p className="text-xs text-muted-foreground mt-2 text-center">
          Paso {currentStep + 1} de {steps.length}
        </p>
      </div>

      {/* Content */}
      <main className="flex-1 flex flex-col items-center justify-center px-6 py-8">
        <div className="w-full max-w-md">
          {/* Icon */}
          <div className="flex justify-center mb-6">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10">
              <Icon className="h-8 w-8 text-primary" />
            </div>
          </div>

          {/* Question */}
          <div className="text-center mb-8">
            <h1 className="font-display text-2xl md:text-3xl font-semibold text-foreground mb-2">
              {step.question}
            </h1>
            <p className="text-muted-foreground font-body">
              {step.subtitle}
            </p>
          </div>

          {/* Options */}
          <div className="space-y-3">
            {step.options.map((option) => {
              const isSelected = isOptionSelected(option.value);
              return (
                <button
                  key={option.value}
                  onClick={() => handleSelect(option.value)}
                  className={cn(
                    'w-full flex items-center gap-4 p-4 rounded-xl border-2 transition-all duration-200',
                    'hover:border-primary/50 hover:bg-primary/5',
                    isSelected
                      ? 'border-primary bg-primary/10 shadow-sm'
                      : 'border-border/50 bg-card'
                  )}
                >
                  {option.emoji && (
                    <span className="text-2xl">{option.emoji}</span>
                  )}
                  <span className={cn(
                    'flex-1 text-left font-medium',
                    isSelected ? 'text-primary' : 'text-foreground'
                  )}>
                    {option.label}
                  </span>
                  {isSelected && (
                    <div className="flex h-6 w-6 items-center justify-center rounded-full bg-primary text-primary-foreground">
                      <Check className="h-4 w-4" />
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      </main>

      {/* Navigation */}
      <footer className="px-6 py-6">
        <div className="max-w-md mx-auto flex items-center gap-3">
          {currentStep > 0 && (
            <Button
              variant="outline"
              size="lg"
              onClick={handleBack}
              className="flex-shrink-0"
            >
              <ChevronLeft className="h-4 w-4 mr-1" />
              Atrás
            </Button>
          )}

          {currentStep < steps.length - 1 ? (
            <Button
              size="lg"
              onClick={handleNext}
              disabled={!canProceed()}
              className="flex-1 bg-primary hover:bg-primary/90"
            >
              Continuar
              <ChevronRight className="h-4 w-4 ml-1" />
            </Button>
          ) : (
            <Button
              size="lg"
              onClick={handleComplete}
              disabled={!canProceed() || isSubmitting}
              className="flex-1 bg-accent hover:bg-accent/90 text-accent-foreground"
            >
              {isSubmitting ? (
                'Guardando...'
              ) : (
                <>
                  <Sparkles className="h-4 w-4 mr-2" />
                  Comenzar a escuchar
                </>
              )}
            </Button>
          )}
        </div>
      </footer>
    </div>
  );
}

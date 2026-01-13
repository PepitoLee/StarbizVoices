'use client';

import { useState, useEffect, useCallback } from 'react';

export interface UserPreferences {
  children_count: string;
  children_ages: string[];
  interests: string[];
  listening_time: string;
}

const PREFERENCES_KEY = 'user_preferences';
const ONBOARDING_COMPLETED_KEY = 'onboarding_completed';

// Mapeo de intereses del onboarding a slugs de categorías
export const interestToCategorySlug: Record<string, string> = {
  sueno: 'sueno',
  alimentacion: 'alimentacion',
  conducta: 'conducta',
  desarrollo: 'desarrollo',
  salud: 'salud',
  bienestar: 'emocional',
};

// Mapeo de duración preferida a segundos
export const durationMap: Record<string, number> = {
  '5min': 5 * 60,
  '15min': 15 * 60,
  '30min': 30 * 60,
};

export function useUserPreferences() {
  const [preferences, setPreferencesState] = useState<UserPreferences | null>(null);
  const [hasCompletedOnboarding, setHasCompletedOnboarding] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Cargar preferencias del localStorage
  useEffect(() => {
    if (typeof window === 'undefined') return;

    try {
      const stored = localStorage.getItem(PREFERENCES_KEY);
      const completed = localStorage.getItem(ONBOARDING_COMPLETED_KEY);

      if (stored) {
        setPreferencesState(JSON.parse(stored));
      }
      setHasCompletedOnboarding(completed === 'true');
    } catch (error) {
      console.error('Error loading preferences:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Actualizar preferencias
  const setPreferences = useCallback((newPreferences: UserPreferences) => {
    if (typeof window === 'undefined') return;

    try {
      localStorage.setItem(PREFERENCES_KEY, JSON.stringify(newPreferences));
      setPreferencesState(newPreferences);
    } catch (error) {
      console.error('Error saving preferences:', error);
    }
  }, []);

  // Marcar onboarding como completado
  const completeOnboarding = useCallback(() => {
    if (typeof window === 'undefined') return;

    try {
      localStorage.setItem(ONBOARDING_COMPLETED_KEY, 'true');
      setHasCompletedOnboarding(true);
    } catch (error) {
      console.error('Error completing onboarding:', error);
    }
  }, []);

  // Limpiar preferencias
  const clearPreferences = useCallback(() => {
    if (typeof window === 'undefined') return;

    try {
      localStorage.removeItem(PREFERENCES_KEY);
      localStorage.removeItem(ONBOARDING_COMPLETED_KEY);
      setPreferencesState(null);
      setHasCompletedOnboarding(false);
    } catch (error) {
      console.error('Error clearing preferences:', error);
    }
  }, []);

  // Obtener slugs de categorías de interés
  const getCategorySlugs = useCallback((): string[] => {
    if (!preferences?.interests) return [];
    return preferences.interests
      .map((interest) => interestToCategorySlug[interest])
      .filter(Boolean);
  }, [preferences]);

  // Obtener duración máxima en segundos
  const getMaxDuration = useCallback((): number | null => {
    if (!preferences?.listening_time) return null;
    return durationMap[preferences.listening_time] || null;
  }, [preferences]);

  return {
    preferences,
    hasCompletedOnboarding,
    isLoading,
    setPreferences,
    completeOnboarding,
    clearPreferences,
    getCategorySlugs,
    getMaxDuration,
  };
}

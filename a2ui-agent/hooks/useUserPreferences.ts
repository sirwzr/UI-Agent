"use client";

import { useCallback, useState, useEffect } from "react";

const STORAGE_KEY = "a2ui-user-prefs";

interface UserPreferences {
  lastPrompt: string | null;
  promptHistory: string[];
  updatedAt: string | null;
}

function loadPrefs(): UserPreferences {
  if (typeof window === "undefined") {
    return { lastPrompt: null, promptHistory: [], updatedAt: null };
  }
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw);
  } catch {
    // corrupted data
  }
  return { lastPrompt: null, promptHistory: [], updatedAt: null };
}

function savePrefs(prefs: UserPreferences) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(prefs));
  } catch {
    // storage full
  }
}

export function useUserPreferences() {
  const [prefs, setPrefs] = useState<UserPreferences>(loadPrefs);

  useEffect(() => {
    setPrefs(loadPrefs());
  }, []);

  const updateLastPrompt = useCallback((prompt: string) => {
    setPrefs((prev) => {
      const history = [prompt, ...prev.promptHistory.filter((p) => p !== prompt)].slice(0, 10);
      const next: UserPreferences = {
        lastPrompt: prompt,
        promptHistory: history,
        updatedAt: new Date().toISOString(),
      };
      savePrefs(next);
      return next;
    });
  }, []);

  return {
    lastPrompt: prefs.lastPrompt,
    promptHistory: prefs.promptHistory,
    updateLastPrompt,
  };
}

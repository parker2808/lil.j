import { useCallback, useEffect, useState } from "react";
import { loadProgress, saveProgress } from "./progress.ts";
import type { Progress } from "../types.ts";

export function useProgress() {
  const [progress, setProgress] = useState<Progress>(() => loadProgress());

  useEffect(() => {
    saveProgress(progress);
  }, [progress]);

  const update = useCallback((recipe: (current: Progress) => Progress) => {
    setProgress((current) => recipe(current));
  }, []);

  return { progress, update };
}

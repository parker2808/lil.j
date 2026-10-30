import { useCallback, useEffect, useState } from "react";
import { FLOW_VERSION } from "./flow.ts";
import { loadProgress, saveProgress } from "./progress.ts";
import type { Progress } from "../types.ts";

export function useProgress() {
  const [progress, setProgress] = useState<Progress>(() => loadProgress());

  useEffect(() => {
    if (progress.flowVersion > FLOW_VERSION) return;
    saveProgress(progress);
  }, [progress]);

  const update = useCallback((recipe: (current: Progress) => Progress) => {
    setProgress((current) => recipe(current));
  }, []);

  return { progress, update };
}

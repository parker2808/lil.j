import { createContext, useContext, useEffect, useRef } from "react";

export type StickyAction = {
  label: string;
  disabled: boolean;
  onClick: () => void;
};

export const StickyNextContext = createContext<(action: StickyAction | null) => void>(() => {});

/** Quiz questions borrow the same corner button. The click is the one from the render that changed the label. */
export function useRegisterSticky(action: StickyAction | null) {
  const setAction = useContext(StickyNextContext);
  const label = action?.label ?? "";
  const disabled = action?.disabled ?? true;
  const active = action != null;
  const onClick = action?.onClick;
  const onClickRef = useRef(onClick);

  useEffect(() => {
    onClickRef.current = onClick;
  }, [onClick]);

  useEffect(() => {
    if (!active) {
      setAction(null);
      return;
    }
    setAction({
      label,
      disabled,
      onClick: () => onClickRef.current?.(),
    });
    return () => setAction(null);
  }, [active, disabled, label, setAction]);
}

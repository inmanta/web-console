import { useEffect, RefObject } from "react";

export const useClickOutside = (
  refs: RefObject<HTMLElement | null>[],
  onClickOutside: () => void,
  enabled: boolean = true
) => {
  useEffect(() => {
    if (!enabled) return;

    const handleClick = (event: MouseEvent) => {
      const isOutside = refs.every(
        (ref) => ref.current && !ref.current.contains(event.target as Node)
      );

      if (isOutside) {
        onClickOutside();
      }
    };

    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [refs, onClickOutside, enabled]);
};

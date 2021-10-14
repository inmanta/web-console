import { useState } from "react";
import { toggleValueInList } from "@/Core";

type IsExpanded = (id: string) => boolean;
type OnExpansion = (id: string) => () => void;

export function useExpansion(): [IsExpanded, OnExpansion] {
  const [expandedKeys, setExpandedKeys] = useState<string[]>([]);

  return [
    (id: string) => expandedKeys.includes(id),
    (id: string) => () => {
      setExpandedKeys(toggleValueInList(id, expandedKeys));
    },
  ];
}

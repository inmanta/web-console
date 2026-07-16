import { useState } from "react";
import { toggleValueInList } from "@/Core";

type IsExpanded = (id: string) => boolean;

type OnExpansion = (id: string) => () => void;

type Expand = (id: string) => void;

export function useExpansion(): [IsExpanded, OnExpansion, Expand] {
  const [expandedKeys, setExpandedKeys] = useState<string[]>([]);

  return [
    (id: string) => expandedKeys.includes(id),
    (id: string) => () => {
      setExpandedKeys(toggleValueInList(id, expandedKeys));
    },
    (id: string) => {
      setExpandedKeys((keys) => (keys.includes(id) ? keys : [...keys, id]));
    },
  ];
}

import { isEqual, identity } from "lodash";
import { toggleValueInList } from "@/Core";
import { useUrlState, StateConfig } from "./useUrlState";

type IsExpanded = (id: string) => boolean;
type OnExpansion = (id: string) => () => void;

export function useUrlStateWithExpansion(
  config: Pick<StateConfig<string[]>, "route">
): [IsExpanded, OnExpansion] {
  const [expandedKeys, setExpandedKeys] = useUrlState<string[]>({
    default: [],
    key: "expansion",
    route: config.route,
    serialize: identity,
    parse: identity,
    equals: isEqual,
  });

  return [
    (id: string) => expandedKeys.includes(id),
    (id: string) => () => {
      setExpandedKeys(toggleValueInList(id, expandedKeys));
    },
  ];
}

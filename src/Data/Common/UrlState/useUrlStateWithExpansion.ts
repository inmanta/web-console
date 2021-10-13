import { isEqual, identity } from "lodash";
import { toggleValueInList } from "@/Core";
import { useUrlState, StateConfig } from "./useUrlState";

type IsExpanded = (id: string) => boolean;
type OnExpansion = (id: string) => () => void;

type Config = Pick<StateConfig<string[]>, "route"> &
  Partial<Pick<StateConfig<string[]>, "key">>;

export function useUrlStateWithExpansion(
  config: Config
): [IsExpanded, OnExpansion] {
  const [expandedKeys, setExpandedKeys] = useUrlState<string[]>({
    default: [],
    key: config.key || "expansion",
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

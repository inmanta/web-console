import { isEqual, identity } from "lodash";
import { toggleValueInList } from "@/Core";
import { handleUrlState } from "./useUrlState";
import { provide, Location, History, StateConfig } from "./helpers";

type IsExpanded = (id: string) => boolean;
type OnExpansion = (id: string) => () => void;

type Config = Pick<StateConfig<string[]>, "route"> &
  Partial<Pick<StateConfig<string[]>, "key">>;

export const useUrlStateWithExpansion = provide(
  handleUrlStateWithExpansionWithCheck
);

export function handleUrlStateWithExpansion(
  config: Config,
  location: Location,
  history: History
): [string[], OnExpansion] {
  const [expandedKeys, setExpandedKeys] = handleUrlState<string[]>(
    {
      default: [],
      key: config.key || "expansion",
      route: config.route,
      serialize: identity,
      parse: identity,
      equals: isEqual,
    },
    location,
    history
  );

  return [
    expandedKeys,
    (id: string) => () => {
      setExpandedKeys(toggleValueInList(id, expandedKeys));
    },
  ];
}

function handleUrlStateWithExpansionWithCheck(
  config: Config,
  location: Location,
  history: History
): [IsExpanded, OnExpansion] {
  const [expandedKeys, onExpansion] = handleUrlStateWithExpansion(
    config,
    location,
    history
  );

  return [(id: string) => expandedKeys.includes(id), onExpansion];
}

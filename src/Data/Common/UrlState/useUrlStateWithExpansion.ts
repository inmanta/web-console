import { toggleValueInList } from "@/Core";
import { isEqual } from "@/Core/Language/collection";
import { provide, Location, Replace, StateConfig, Update } from "./helpers";
import { useUrlStateHandler } from "./useUrlState";

type IsExpanded = (id: string) => boolean;

type OnExpansion = (id: string) => () => void;

type Config = Pick<StateConfig<string[]>, "route"> & Partial<Pick<StateConfig<string[]>, "key">>;

export const useUrlStateWithExpansion = provide(useHandleUrlStateWithExpansionWrapped);

export function useHandleUrlStateWithExpansion(
  config: Config,
  location: Location,
  replace: Replace
): [string[], Update<string[]>] {
  return useUrlStateHandler<string[]>(
    {
      default: [],
      key: config.key || "expansion",
      route: config.route,
      serialize: (data) => data,
      parse: (value) => value as string[] | undefined,
      equals: isEqual,
    },
    location,
    replace
  );
}

function useHandleUrlStateWithExpansionWrapped(
  config: Config,
  location: Location,
  replace: Replace
): [IsExpanded, OnExpansion] {
  const [expandedKeys, setExpandedKeys] = useHandleUrlStateWithExpansion(config, location, replace);

  return [
    (id: string) => expandedKeys.includes(id),
    (id: string) => () => {
      setExpandedKeys(toggleValueInList(id, expandedKeys));
    },
  ];
}

import { isEqual, identity } from "lodash-es";
import { toggleValueInList } from "@/Core";
import { provide, Location, Replace, StateConfig, Update } from "./helpers";
import { handleUrlState } from "./useUrlState";

type IsExpanded = (id: string) => boolean;
type OnExpansion = (id: string) => () => void;

type Config = Pick<StateConfig<string[]>, "route"> &
  Partial<Pick<StateConfig<string[]>, "key">>;

export const useUrlStateWithExpansion = provide(
  handleUrlStateWithExpansionWrapped,
);

export function handleUrlStateWithExpansion(
  config: Config,
  location: Location,
  replace: Replace,
): [string[], Update<string[]>] {
  return handleUrlState<string[]>(
    {
      default: [],
      key: config.key || "expansion",
      route: config.route,
      serialize: identity,
      parse: identity,
      equals: isEqual,
    },
    location,
    replace,
  );
}

function handleUrlStateWithExpansionWrapped(
  config: Config,
  location: Location,
  replace: Replace,
): [IsExpanded, OnExpansion] {
  const [expandedKeys, setExpandedKeys] = handleUrlStateWithExpansion(
    config,
    location,
    replace,
  );

  return [
    (id: string) => expandedKeys.includes(id),
    (id: string) => () => {
      setExpandedKeys(toggleValueInList(id, expandedKeys));
    },
  ];
}

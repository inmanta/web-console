import { PageSize } from "@/Core";
import { from } from "@/Core/Domain/PageSize";
import { provide, Location, Replace, StateConfig, Update } from "./helpers";
import { handleUrlState } from "./useUrlState";

export const useUrlStateWithPageSize = provide(handleUrlStateWithPageSize);

export function handleUrlStateWithPageSize(
  config: Pick<StateConfig<PageSize.Type>, "route">,
  location: Location,
  replace: Replace,
): [PageSize.Type, Update<PageSize.Type>] {
  const defaultPageSize =
    config.route === "ResourceDetails" ? from("100") : PageSize.initial;

  return handleUrlState<PageSize.Type>(
    {
      default: defaultPageSize,
      key: "pageSize",
      route: config.route,
      serialize: PageSize.serialize,
      parse: PageSize.parse,
      equals: PageSize.equals,
    },
    location,
    replace,
  );
}

import { PageSize } from "@/Core";
import { handleUrlState, StateConfig, Location, History } from "./useUrlState";

test("handleUrlState", () => {
  const config: StateConfig<PageSize.Type> = {
    default: PageSize.initial,
    key: "pageSize",
    route: "Inventory",
    serialize: PageSize.serialize,
    parse: PageSize.parse,
    equals: PageSize.equals,
  };
  const location: Location = {
    pathname: "",
    search: "",
    hash: "",
  };
  const history: History = {
    replace() {
      return undefined;
    },
  };

  expect(handleUrlState(config, location, history)[0]).toEqual(
    PageSize.initial
  );
});

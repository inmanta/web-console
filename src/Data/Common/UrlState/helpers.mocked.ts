import { Location } from "./helpers";

export const getMockedLocation = (search: string): Location => ({
  pathname: "",
  search,
  hash: "",
});

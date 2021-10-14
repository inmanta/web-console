import { Location, History } from "./helpers";

export const mockedHistory: History = {
  replace() {
    return undefined;
  },
};

export const getMockedLocation = (search: string): Location => ({
  pathname: "",
  search,
  hash: "",
});

import { BaseApiHelper, KeycloakAuthHelper } from "@/Data";
import { getStoreInstance } from "../Store";
import { CommandManagerResolver } from "./CommandManagerResolver";

it("CommandManagerResolver should replace managers when environment changes", () => {
  const commandManagerResolver = new CommandManagerResolver(
    getStoreInstance(),
    new BaseApiHelper(),
    new KeycloakAuthHelper()
  );
  commandManagerResolver.resolve("env1");
  const originalLength = commandManagerResolver.get().length;
  commandManagerResolver.resolve("env2");
  expect(commandManagerResolver.get()).toHaveLength(originalLength);
});

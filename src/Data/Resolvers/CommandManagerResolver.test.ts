import { BaseApiHelper, KeycloakAuthHelper, getStoreInstance } from "@/Data";
import { CommandManagerResolver } from "./CommandManagerResolver";

it("CommandManagerResolver should replace managers when environment changes", () => {
  const commandManagerResolver = new CommandManagerResolver(
    getStoreInstance(),
    new BaseApiHelper(),
    new KeycloakAuthHelper()
  );
  commandManagerResolver.resolve();
  const originalLength = commandManagerResolver.get().length;
  commandManagerResolver.resolve();
  expect(commandManagerResolver.get()).toHaveLength(originalLength);
});

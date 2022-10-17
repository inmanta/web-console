import { Command, ApiHelper, Either } from "@/Core";
import { CommandManagerWithEnv } from "@/Data/Common";

export function GenerateTokenCommandManager(apiHelper: ApiHelper) {
  return CommandManagerWithEnv<"GenerateToken">(
    "GenerateToken",
    (command, environment) => {
      return async (tokenInfo) =>
        Either.mapRight(
          (data) => data.data,
          await apiHelper.post<Command.ApiData<"GenerateToken">>(
            "/api/v2/environment_auth",
            environment,
            tokenInfo
          )
        );
    }
  );
}

import { Command, ApiHelper, Either } from "@/Core";
import { CommandManagerWithEnv } from "@/Data/Common";

export class GenerateTokenCommandManager extends CommandManagerWithEnv<"GenerateToken"> {
  constructor(private readonly apiHelper: ApiHelper) {
    super("GenerateToken", (command, environment) => {
      return async (tokenInfo) =>
        Either.mapRight(
          (data) => data.data,
          await this.apiHelper.post<Command.ApiData<"GenerateToken">>(
            "/api/v2/environment_auth",
            environment,
            tokenInfo
          )
        );
    });
  }
}

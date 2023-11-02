import { Command, ApiHelper, Either } from "@/Core";
import { CommandManagerWithoutEnv } from "@/Data/Common";

export class GetSupportArchiveCommandManager extends CommandManagerWithoutEnv<"GetSupportArchive"> {
  constructor(private readonly apiHelper: ApiHelper) {
    super("GetSupportArchive", () => {
      return async () =>
        Either.mapRight(
          (data) => data.data,
          await this.apiHelper.getWithoutEnvironment<
            Command.ApiData<"GetSupportArchive">
          >("/api/v2/support"),
        );
    });
  }
}

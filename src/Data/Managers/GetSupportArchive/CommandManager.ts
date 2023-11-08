import { Command, ApiHelper, Either } from "@/Core";
import { CommandManagerWithoutEnv } from "@/Data/Common";

export class GetSupportArchiveCommandManager extends CommandManagerWithoutEnv<"GetSupportArchive"> {
  constructor(private readonly apiHelper: ApiHelper) {
    super("GetSupportArchive", () => {
      return async () =>
        Either.mapRight(
          (data) => {
            return data;
          },
          await this.apiHelper.getZipWithoutEnvironment<
            Command.ApiData<"GetSupportArchive">
          >("/api/v2/support"),
        );
    });
  }
}

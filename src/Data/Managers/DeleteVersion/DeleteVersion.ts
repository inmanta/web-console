import { ApiHelper } from "@/Core";
import { CommandManagerWithEnv } from "@/Data/Common";

export class DeleteVersionCommandManager extends CommandManagerWithEnv<"DeleteVersion"> {
  constructor(private readonly apiHelper: ApiHelper) {
    super("DeleteVersion", ({ version }, environment) => {
      return () =>
        this.apiHelper.delete(`/api/v1/version/${version}`, environment);
    });
  }
}

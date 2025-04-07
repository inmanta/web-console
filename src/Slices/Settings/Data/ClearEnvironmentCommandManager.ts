import { ApiHelper } from "@/Core";
import { CommandManagerWithoutEnv } from "@/Data/Common";

export class ClearEnvironmentCommandManager extends CommandManagerWithoutEnv<"ClearEnvironment"> {
  constructor(private readonly apiHelper: ApiHelper) {
    super("ClearEnvironment", ({ id }) => async () => {
      return await this.apiHelper.delete(`/api/v2/decommission/${id}`, id);
    });
  }
}

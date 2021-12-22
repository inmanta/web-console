import { ApiHelper } from "@/Core";
import { CommandManagerWithEnv } from "@/Data/Common";

export class DeleteServiceCommandManager extends CommandManagerWithEnv<"DeleteService"> {
  constructor(private readonly apiHelper: ApiHelper) {
    super("DeleteService", ({ name }, environment) => {
      return () =>
        this.apiHelper.delete(`/lsm/v1/service_catalog/${name}`, environment);
    });
  }
}

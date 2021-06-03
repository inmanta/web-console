import { ApiHelper } from "@/Core";
import { PosterImpl } from "@/Infra";

export class ServiceConfigPoster extends PosterImpl<"ServiceConfig"> {
  constructor(apiHelper: ApiHelper, environment: string) {
    super(
      apiHelper,
      environment,
      ({ name }) =>
        `${apiHelper.getBaseUrl()}/lsm/v1/service_catalog/${name}/config`
    );
  }
}

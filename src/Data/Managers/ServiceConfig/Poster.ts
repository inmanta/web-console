import { ApiHelper } from "@/Core";
import { PosterImpl } from "@/Data/API";

export class ServiceConfigPoster extends PosterImpl<"UpdateServiceConfig"> {
  constructor(apiHelper: ApiHelper, environment: string) {
    super(
      apiHelper,
      environment,
      ({ name }) => `/lsm/v1/service_catalog/${name}/config`
    );
  }
}

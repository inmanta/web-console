import { ApiHelper } from "@/Core";
import { PosterImpl } from "@/Infra";

export class CreateInstancePoster extends PosterImpl<"CreateInstance"> {
  constructor(apiHelper: ApiHelper, environment: string) {
    super(
      apiHelper,
      environment,
      ({ service_entity }) =>
        `${apiHelper.getBaseUrl()}/lsm/v1/service_inventory/${service_entity}`
    );
  }
}

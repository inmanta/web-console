import { ApiHelper } from "@/Core";
import { PosterImpl } from "@/Data/API";

export class CreateInstancePoster extends PosterImpl<"CreateInstance"> {
  constructor(apiHelper: ApiHelper, environment: string) {
    super(
      apiHelper,
      environment,
      ({ service_entity }) => `/lsm/v1/service_inventory/${service_entity}`
    );
  }
}

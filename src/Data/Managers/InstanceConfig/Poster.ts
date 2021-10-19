import { ApiHelper } from "@/Core";
import { PosterImpl } from "@/Data/API";

export class InstanceConfigPoster extends PosterImpl<"InstanceConfig"> {
  constructor(apiHelper: ApiHelper, environment: string) {
    super(
      apiHelper,
      environment,
      ({ service_entity, id, version }) =>
        `/lsm/v1/service_inventory/${service_entity}/${id}/config?current_version=${version}`
    );
  }
}

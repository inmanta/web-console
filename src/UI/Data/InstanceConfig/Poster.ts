import { ApiHelper } from "@/Core";
import { PosterImpl } from "@/Infra";

export class InstanceConfigPoster extends PosterImpl<"InstanceConfig"> {
  constructor(apiHelper: ApiHelper, environment: string) {
    super(
      apiHelper,
      environment,
      ({ service_entity, id, version }) =>
        `${apiHelper.getBaseUrl()}/lsm/v1/service_inventory/${service_entity}/${id}/config?current_version=${version}`
    );
  }
}

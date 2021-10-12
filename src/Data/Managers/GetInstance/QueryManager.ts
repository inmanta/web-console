import { Fetcher, StateHelper, Scheduler } from "@/Core";
import { identity } from "lodash";
import { ContinuousQueryManagerImpl } from "@/Data/Common";

export class ServiceInstanceQueryManager extends ContinuousQueryManagerImpl<"ServiceInstance"> {
  constructor(
    fetcher: Fetcher<"ServiceInstance">,
    stateHelper: StateHelper<"ServiceInstance">,
    scheduler: Scheduler,
    environment: string
  ) {
    super(
      fetcher,
      stateHelper,
      scheduler,
      ({ id }) => id,
      ({ id }) => [id],
      "ServiceInstance",
      ({ service_entity, id }) =>
        `/lsm/v1/service_inventory/${service_entity}/${id}`,
      identity,
      environment
    );
  }
}

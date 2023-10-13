import { useContext, useEffect } from "react";
import {
  OneTimeQueryManager,
  Query,
  RemoteData,
  StateHelper,
  ConfigFinalizer,
  ApiHelper,
} from "@/Core";
import { DependencyContext } from "@/UI/Dependency";

type Data = RemoteData.Type<
  Query.Error<"GetInstanceConfig">,
  Query.UsedData<"GetInstanceConfig">
>;

export function InstanceConfigQueryManager(
  apiHelper: ApiHelper,
  stateHelper: StateHelper<"GetInstanceConfig">,
  configFinalizer: ConfigFinalizer<"GetInstanceConfig">,
): OneTimeQueryManager<"GetInstanceConfig"> {
  function getConfigUrl({
    service_entity,
    id,
  }: Query.SubQuery<"GetInstanceConfig">): string {
    return `/lsm/v1/service_inventory/${service_entity}/${id}/config`;
  }

  function initialize(query: Query.SubQuery<"GetInstanceConfig">): void {
    const value = stateHelper.getOnce(query);
    if (RemoteData.isNotAsked(value)) {
      stateHelper.set(RemoteData.loading(), query);
    }
  }

  async function update(
    query: Query.SubQuery<"GetInstanceConfig">,
    url: string,
    environment: string,
  ): Promise<void> {
    stateHelper.set(
      RemoteData.fromEither(await apiHelper.get(url, environment)),
      query,
    );
  }

  function useOneTime(
    query: Query.SubQuery<"GetInstanceConfig">,
  ): [Data, () => void] {
    const { environmentHandler } = useContext(DependencyContext);
    const environment = environmentHandler.useId();
    const { service_entity } = query;

    useEffect(() => {
      initialize(query);
      update(query, getConfigUrl(query), environment);
    }, [environment]); /* eslint-disable-line react-hooks/exhaustive-deps */

    return [
      configFinalizer.finalize(
        stateHelper.useGetHooked(query),
        service_entity,
        environment,
      ),
      () => update(query, getConfigUrl(query), environment),
    ];
  }

  function matches(query: Query.SubQuery<"GetInstanceConfig">): boolean {
    return query.kind === "GetInstanceConfig";
  }
  return {
    useOneTime,
    matches,
  };
}

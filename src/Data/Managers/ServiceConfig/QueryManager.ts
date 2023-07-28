import { useContext, useEffect } from "react";
import {
  OneTimeQueryManager,
  Query,
  RemoteData,
  StateHelper,
  ConfigFinalizer,
  ApiHelper,
} from "@/Core";
import { DependencyContext } from "@/UI";

type Data = RemoteData.Type<
  Query.Error<"GetServiceConfig">,
  Query.UsedData<"GetServiceConfig">
>;

export function ServiceConfigQueryManager(
  apiHelper: ApiHelper,
  stateHelper: StateHelper<"GetServiceConfig">,
  configFinalizer: ConfigFinalizer<"GetServiceConfig">,
): OneTimeQueryManager<"GetServiceConfig"> {
  function getConfigUrl({ name }: Query.SubQuery<"GetServiceConfig">): string {
    return `/lsm/v1/service_catalog/${name}/config`;
  }

  function initialize(query: Query.SubQuery<"GetServiceConfig">): void {
    const value = stateHelper.getOnce(query);
    if (RemoteData.isNotAsked(value)) {
      stateHelper.set(RemoteData.loading(), query);
    }
  }

  async function update(
    query: Query.SubQuery<"GetServiceConfig">,
    url: string,
    environment: string,
  ): Promise<void> {
    stateHelper.set(
      RemoteData.fromEither(await apiHelper.get(url, environment)),
      query,
    );
  }

  function useOneTime(
    query: Query.SubQuery<"GetServiceConfig">,
  ): [Data, () => void] {
    const { environmentHandler } = useContext(DependencyContext);
    const environment = environmentHandler.useId();
    const { name } = query;

    useEffect(() => {
      initialize(query);
      update(query, getConfigUrl(query), environment);
    }, [environment]); /* eslint-disable-line react-hooks/exhaustive-deps */
    return [
      configFinalizer.finalize(
        stateHelper.useGetHooked(query),
        name,
        environment,
      ),
      () => update(query, getConfigUrl(query), environment),
    ];
  }

  function matches(query: Query.SubQuery<"GetServiceConfig">): boolean {
    return query.kind === "GetServiceConfig";
  }
  return {
    useOneTime,
    matches,
  };
}

/**
 * @DANGER Disabling these hooks rules is dangerous for an entire file.
 * When you edit this file, turn the rule off so you know you are not missing anything.
 */

/* eslint-disable react-hooks/exhaustive-deps */

import { useContext, useEffect, useState } from "react";
import {
  RemoteData,
  Query,
  ContinuousQueryManager,
  QueryManagerKind,
  Scheduler,
  ApiHelper,
  StateHelperWithEnv,
} from "@/Core";
import { DependencyContext } from "@/UI";
import {
  Data,
  GetUniqueWithEnv,
  GetDependenciesWithEnv,
  GetUrlWithEnv,
  ToUsed,
} from "./types";
import { usePrevious } from "./usePrevious";
import { urlEncodeParams } from "./utils";

export function ContinuousWithEnv<Kind extends Query.Kind>(
  apiHelper: ApiHelper,
  stateHelper: StateHelperWithEnv<Kind>,
  scheduler: Scheduler,
  getUnique: GetUniqueWithEnv<Kind>,
  getDependencies: GetDependenciesWithEnv<Kind>,
  kind: Kind,
  getUrl: GetUrlWithEnv<Kind>,
  toUsed: ToUsed<Kind>,
): ContinuousQueryManager<Kind> {
  async function update(
    query: Query.SubQuery<Kind>,
    url: string,
    environment: string,
  ): Promise<void> {
    stateHelper.set(
      RemoteData.fromEither(await apiHelper.get(url, environment)),
      query,
      environment,
    );
  }

  function useContinuous(query: Query.SubQuery<Kind>): Data<Kind> {
    const { environmentHandler } = useContext(DependencyContext);
    const environment = environmentHandler.useId();
    const [url, setUrl] = useState(getUrl(urlEncodeParams(query), environment));
    const previousEnvironment = usePrevious(environment);

    useEffect(
      () => {
        setUrl(getUrl(urlEncodeParams(query), environment));
      },
      getDependencies(query, environment),
    );

    const task = {
      effect: async () =>
        RemoteData.fromEither(await apiHelper.get(url, environment)),
      update: (data) => stateHelper.set(data, query, environment),
    };

    useEffect(() => {
      stateHelper.set(RemoteData.loading(), query, environment);
      // If the environment changed, use the url derived from the query
      // Otherwise the url has changed, use it to not lose e.g. paging state
      const urlToUse =
        environment !== previousEnvironment
          ? getUrl(urlEncodeParams(query), environment)
          : url;
      update(query, urlToUse, environment);
      scheduler.register(getUnique(query, environment), task);
      return () => {
        scheduler.unregister(getUnique(query, environment));
      };
    }, [url, environment]);

    return [
      RemoteData.mapSuccess(
        (data) => toUsed(data, setUrl),
        stateHelper.useGetHooked(query, environment),
      ),
      () => update(query, url, environment),
    ];
  }

  function matches(
    query: Query.SubQuery<Kind>,
    matchingKind: QueryManagerKind,
  ): boolean {
    return query.kind === kind && matchingKind === "Continuous";
  }
  return {
    useContinuous,
    matches,
  };
}

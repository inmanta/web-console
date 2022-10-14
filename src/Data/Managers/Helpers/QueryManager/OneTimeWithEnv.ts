/**
 * @DANGER Disabling these hooks rules is dangerous for an entire file.
 * When you edit this file, turn the rule off so you know you are not missing anything.
 */

/* eslint-disable react-hooks/exhaustive-deps */

import { useContext, useEffect, useState } from "react";
import {
  RemoteData,
  Query,
  OneTimeQueryManager,
  QueryManagerKind,
  ApiHelper,
  StateHelperWithEnv,
} from "@/Core";
import { DependencyContext } from "@/UI";
import { Data, GetDependenciesWithEnv, GetUrlWithEnv, ToUsed } from "./types";
import { usePrevious } from "./usePrevious";
import { urlEncodeParams } from "./utils";

export function OneTimeWithEnv<Kind extends Query.Kind>(
  apiHelper: ApiHelper,
  stateHelper: StateHelperWithEnv<Kind>,
  getDependencies: GetDependenciesWithEnv<Kind>,
  kind: Kind,
  getUrl: GetUrlWithEnv<Kind>,
  toUsed: ToUsed<Kind>,
  strategy: "MERGE" | "RELOAD" = "RELOAD"
): OneTimeQueryManager<Kind> {
  async function update(
    query: Query.SubQuery<Kind>,
    url: string,
    environment: string
  ): Promise<void> {
    stateHelper.set(
      RemoteData.fromEither(await apiHelper.get(url, environment)),
      query,
      environment
    );
  }

  function useOneTime(query: Query.SubQuery<Kind>): Data<Kind> {
    const { environmentHandler } = useContext(DependencyContext);
    const environment = environmentHandler.useId();
    const [url, setUrl] = useState(getUrl(urlEncodeParams(query), environment));
    const previousEnvironment = usePrevious(environment);

    useEffect(() => {
      setUrl(getUrl(urlEncodeParams(query), environment));
    }, getDependencies(query, environment));

    useEffect(() => {
      if (
        strategy === "RELOAD" ||
        RemoteData.isNotAsked(stateHelper.getOnce(query, environment))
      ) {
        stateHelper.set(RemoteData.loading(), query, environment);
      }
      // If the environment changed, use the url derived from the query
      // Otherwise the url has changed, use it to not lose e.g. paging state
      const urlToUse =
        environment !== previousEnvironment
          ? getUrl(urlEncodeParams(query), environment)
          : url;
      update(query, urlToUse, environment);
    }, [url, environment]);

    return [
      RemoteData.mapSuccess(
        (d) => toUsed(d, setUrl),
        stateHelper.useGetHooked(query, environment)
      ),
      () => update(query, url, environment),
    ];
  }

  function matches(
    query: Query.SubQuery<Kind>,
    matchingKind: QueryManagerKind
  ): boolean {
    return query.kind === kind && matchingKind === "OneTime";
  }
  return {
    useOneTime,
    matches,
  };
}

/**
 * @DANGER Disabling these hooks rules is dangerous for an entire file.
 * When you edit this file, turn the rule off so you know you are not missing anything.
 */

/* eslint-disable react-hooks/exhaustive-deps */

import { useEffect, useState } from "react";
import {
  RemoteData,
  Query,
  ContinuousQueryManager,
  QueryManagerKind,
  StateHelper,
  Scheduler,
  ApiHelper,
} from "@/Core";
import { GetDependencies, Data, GetUnique, GetUrl, ToUsed } from "./types";
import { urlEncodeParams } from "./utils";

export function Continuous<Kind extends Query.Kind>(
  apiHelper: ApiHelper,
  stateHelper: StateHelper<Kind>,
  scheduler: Scheduler,
  getUnique: GetUnique<Kind>,
  getDependencies: GetDependencies<Kind>,
  kind: Kind,
  getUrl: GetUrl<Kind>,
  toUsed: ToUsed<Kind>,
): ContinuousQueryManager<Kind> {
  async function update(
    query: Query.SubQuery<Kind>,
    url: string,
  ): Promise<void> {
    stateHelper.set(
      RemoteData.fromEither(await apiHelper.getWithoutEnvironment(url)),
      query,
    );
  }

  function useContinuous(query: Query.SubQuery<Kind>): Data<Kind> {
    const [url, setUrl] = useState(getUrl(urlEncodeParams(query)));

    useEffect(() => {
      setUrl(getUrl(urlEncodeParams(query)));
    }, getDependencies(query));

    const task = {
      effect: async () =>
        RemoteData.fromEither(await apiHelper.getWithoutEnvironment(url)),
      update: (data) => stateHelper.set(data, query),
    };

    useEffect(() => {
      stateHelper.set(RemoteData.loading(), query);
      update(query, url);
      scheduler.register(getUnique(query), task);
      return () => {
        scheduler.unregister(getUnique(query));
      };
    }, [url]);

    return [
      RemoteData.mapSuccess(
        (data) => toUsed(data, setUrl),
        stateHelper.useGetHooked(query),
      ),
      () => update(query, url),
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

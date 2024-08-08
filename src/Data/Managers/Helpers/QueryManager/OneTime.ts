/**
 * @DANGER Disabling these hooks rules is dangerous for an entire file.
 * When you edit this file, turn the rule off so you know you are not missing anything.
 */

/* eslint-disable react-hooks/exhaustive-deps */

import { useEffect, useState } from "react";
import {
  RemoteData,
  Query,
  OneTimeQueryManager,
  QueryManagerKind,
  StateHelper,
  ApiHelper,
} from "@/Core";
import { GetDependencies, Data, GetUrl, ToUsed } from "./types";
import { urlEncodeParams } from "./utils";

export function OneTime<Kind extends Query.Kind>(
  apiHelper: ApiHelper,
  stateHelper: StateHelper<Kind>,
  getDependencies: GetDependencies<Kind>,
  kind: Kind,
  getUrl: GetUrl<Kind>,
  toUsed: ToUsed<Kind>,
  strategy: "MERGE" | "RELOAD",
): OneTimeQueryManager<Kind> {
  async function update(
    query: Query.SubQuery<Kind>,
    url: string,
  ): Promise<void> {
    stateHelper.set(
      RemoteData.fromEither(await apiHelper.getWithoutEnvironment(url)),
      query,
    );
  }

  function useOneTime(query: Query.SubQuery<Kind>): Data<Kind> {
    const [url, setUrl] = useState(getUrl(urlEncodeParams(query)));

    useEffect(() => {
      setUrl(getUrl(urlEncodeParams(query)));
    }, getDependencies(query));

    useEffect(() => {
      if (
        strategy === "RELOAD" ||
        RemoteData.isNotAsked(stateHelper.getOnce(query))
      ) {
        stateHelper.set(RemoteData.loading(), query);
      }
      update(query, url);
    }, [url]);

    return [
      RemoteData.mapSuccess(
        (d) => toUsed(d, setUrl),
        stateHelper.useGetHooked(query),
      ),
      () => update(query, url),
    ];
  }

  function matches(
    query: Query.SubQuery<Kind>,
    matchingKind: QueryManagerKind,
  ): boolean {
    return query.kind === kind && matchingKind === "OneTime";
  }
  return {
    useOneTime,
    matches,
  };
}

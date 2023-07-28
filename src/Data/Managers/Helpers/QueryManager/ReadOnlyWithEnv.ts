/**
 * @DANGER Disabling these hooks rules is dangerous for an entire file.
 * When you edit this file, turn the rule off so you know you are not missing anything.
 */

/* eslint-disable react-hooks/exhaustive-deps */

import { useContext } from "react";
import {
  RemoteData,
  Query,
  QueryManagerKind,
  StateHelperWithEnv,
  ReadOnlyQueryManager,
} from "@/Core";
import { DependencyContext } from "@/UI";
import { ReadOnlyToUsed } from "./types";

export function ReadOnlyWithEnv<Kind extends Query.Kind>(
  stateHelper: StateHelperWithEnv<Kind>,
  kind: Kind,
  toUsed: ReadOnlyToUsed<Kind>,
): ReadOnlyQueryManager<Kind> {
  function useReadOnly(
    query: Query.SubQuery<Kind>,
  ): RemoteData.Type<Query.Error<Kind>, Query.UsedData<Kind>> {
    const { environmentHandler } = useContext(DependencyContext);
    const environment = environmentHandler.useId();

    return RemoteData.mapSuccess(
      (data) => toUsed(data),
      stateHelper.useGetHooked(query, environment),
    );
  }

  function matches(
    query: Query.SubQuery<Kind>,
    matchingKind: QueryManagerKind,
  ): boolean {
    return query.kind === kind && matchingKind === "ReadOnly";
  }
  return {
    useReadOnly,
    matches,
  };
}

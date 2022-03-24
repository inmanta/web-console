/**
 * @DANGER Disabling these hooks rules is dangerous for an entire file.
 * When you edit this file, turn the rule off so you know you are not missing anything.
 */

/* eslint-disable react-hooks/rules-of-hooks, react-hooks/exhaustive-deps */

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

export class ReadOnlyWithEnv<Kind extends Query.Kind>
  implements ReadOnlyQueryManager<Kind>
{
  constructor(
    private readonly stateHelper: StateHelperWithEnv<Kind>,
    private readonly kind: Kind,
    private readonly toUsed: ReadOnlyToUsed<Kind>
  ) {}

  useReadOnly(
    query: Query.SubQuery<Kind>
  ): RemoteData.Type<Query.Error<Kind>, Query.UsedData<Kind>> {
    const { environmentHandler } = useContext(DependencyContext);
    const environment = environmentHandler.useId();

    return RemoteData.mapSuccess(
      (data) => this.toUsed(data),
      this.stateHelper.getHooked(query, environment)
    );
  }

  matches(query: Query.SubQuery<Kind>, kind: QueryManagerKind): boolean {
    return query.kind === this.kind && kind === "ReadOnly";
  }
}

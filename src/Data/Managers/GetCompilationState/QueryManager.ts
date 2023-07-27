import { useContext, useEffect, useState } from "react";
import {
  ApiHelper,
  QueryManagerKind,
  Query,
  RemoteData,
  Scheduler,
} from "@/Core";
import { DependencyContext } from "@/UI/Dependency";

export function GetCompilationStateQueryManager(
  apiHelper: ApiHelper,
  scheduler: Scheduler,
) {
  function useContinuous(
    query: Query.SubQuery<"GetCompilationState">,
  ): [RemoteData.RemoteData<undefined, boolean>, () => void] {
    const { environmentHandler } = useContext(DependencyContext);
    const environment = environmentHandler.useId();
    const URL = `/api/v1/notify/${environment}`;

    const [compilerStatus, setCompilerStatus] = useState<
      RemoteData.RemoteData<undefined, boolean>
    >(RemoteData.notAsked());

    const setCompilerStatusFromCode = (code: number) =>
      setCompilerStatus(RemoteData.success(code === 200));

    useEffect(() => {
      setCompilerStatus(RemoteData.loading());
      const task = {
        effect: async () => await apiHelper.head(URL),
        update: setCompilerStatusFromCode,
      };
      const update = async () => {
        setCompilerStatusFromCode(await apiHelper.head(URL));
      };
      update();
      scheduler.register(query.kind, task);
      return () => {
        scheduler.unregister(query.kind);
      };
    }, [URL, query.kind]);

    const refetch = async () => {
      setCompilerStatus(RemoteData.loading());
      setCompilerStatusFromCode(await apiHelper.head(URL));
    };

    return [compilerStatus, () => refetch()];
  }

  function matches(
    query: Query.SubQuery<"GetCompilationState">,
    kind: QueryManagerKind,
  ): boolean {
    return query.kind === "GetCompilationState" && kind === "Continuous";
  }
  return {
    useContinuous,
    matches,
  };
}

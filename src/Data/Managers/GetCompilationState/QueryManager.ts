import { useContext, useEffect, useState } from "react";
import {
  ApiHelper,
  ContinuousQueryManager,
  QueryManagerKind,
  Query,
  RemoteData,
  Scheduler,
} from "@/Core";
import { DependencyContext } from "@/UI/Dependency";

export class GetCompilationStateQueryManager
  implements ContinuousQueryManager<"GetCompilationState">
{
  constructor(
    private readonly apiHelper: ApiHelper,
    private readonly scheduler: Scheduler
  ) {}

  useContinuous(
    query: Query.SubQuery<"GetCompilationState">
  ): [RemoteData.RemoteData<undefined, boolean>, () => void] {
    // eslint-disable-next-line react-hooks/rules-of-hooks
    const { environmentHandler } = useContext(DependencyContext);
    const environment = environmentHandler.useId();
    const URL = `/api/v1/notify/${environment}`;

    // eslint-disable-next-line react-hooks/rules-of-hooks
    const [compilerStatus, setCompilerStatus] = useState<
      RemoteData.RemoteData<undefined, boolean>
    >(RemoteData.notAsked());

    const setCompilerStatusFromCode = (code: number) =>
      setCompilerStatus(RemoteData.success(code === 200));

    // eslint-disable-next-line react-hooks/rules-of-hooks
    useEffect(() => {
      setCompilerStatus(RemoteData.loading());
      const task = {
        effect: async () => await this.apiHelper.head(URL),
        update: setCompilerStatusFromCode,
      };
      const update = async () => {
        setCompilerStatusFromCode(await this.apiHelper.head(URL));
      };
      update();
      this.scheduler.register(query.kind, task);
      return () => {
        this.scheduler.unregister(query.kind);
      };
    }, [URL, query.kind]);

    const refetch = async () => {
      setCompilerStatus(RemoteData.loading());
      setCompilerStatusFromCode(await this.apiHelper.head(URL));
    };

    return [compilerStatus, () => refetch()];
  }

  matches(
    query: Query.SubQuery<"GetCompilationState">,
    kind: QueryManagerKind
  ): boolean {
    return query.kind === "GetCompilationState" && kind === "Continuous";
  }
}

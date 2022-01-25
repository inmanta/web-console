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

export class GetCompilerStatusQueryManager
  implements ContinuousQueryManager<"GetCompilerStatus">
{
  constructor(
    private readonly apiHelper: ApiHelper,
    private readonly scheduler: Scheduler
  ) {}

  useContinuous(
    query: Query.SubQuery<"GetCompilerStatus">
  ): [RemoteData.RemoteData<undefined, boolean>, () => void] {
    // eslint-disable-next-line react-hooks/rules-of-hooks
    const { environmentHandler } = useContext(DependencyContext);
    const environment = environmentHandler.useId();
    const URL = `/api/v1/notify/${environment}`;

    // eslint-disable-next-line react-hooks/rules-of-hooks
    const [compiling, setCompiling] = useState<
      RemoteData.RemoteData<undefined, boolean>
    >(RemoteData.notAsked());

    // eslint-disable-next-line react-hooks/rules-of-hooks
    useEffect(() => {
      const task = {
        effect: async () => await this.apiHelper.head(URL),
        update: (code: number) => setCompiling(getCompilingForStatusCode(code)),
      };
      const update = async () => {
        setCompiling(getCompilingForStatusCode(await this.apiHelper.head(URL)));
      };
      update();
      this.scheduler.register(query.kind, task);
      return () => {
        this.scheduler.unregister(query.kind);
      };
    }, [URL, query.kind]);

    return [
      compiling,
      () => async () => {
        setCompiling(RemoteData.loading());
        setCompiling(getCompilingForStatusCode(await this.apiHelper.head(URL)));
      },
    ];
  }

  matches(
    query: Query.SubQuery<"GetCompilerStatus">,
    kind: QueryManagerKind
  ): boolean {
    return query.kind === "GetCompilerStatus" && kind === "Continuous";
  }
}

const getCompilingForStatusCode = (
  statusCode: number
): RemoteData.RemoteData<undefined, boolean> =>
  statusCode === 200 ? RemoteData.success(true) : RemoteData.success(false);

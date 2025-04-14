import { QueryManager, ApiHelper, Scheduler, QueryManagerResolver } from "@/Core";
import { Store } from "@/Data/Store";
import { GetOrdersQueryManager } from "@/Slices/Orders/Data/QueryManager";
import { GetAgentsQueryManager } from "@S/Agents/Data";
import { GetDryRunReportQueryManager, GetDryRunsQueryManager } from "@S/ComplianceCheck/Data";
import { EventsQueryManager, EventsStateHelper } from "@S/Events/Data";
import { GetFactsQueryManager } from "@S/Facts/Data";
import { GetOrderDetailsQueryManager } from "@S/OrderDetails/Data/QueryManager";
import { GetOrdersStateHelper } from "@S/Orders/Data/StateHelper";
import { GetParametersQueryManager, GetParametersStateHelper } from "@S/Parameters/Data";
import { CallbacksQueryManager, CallbacksStateHelper } from "@S/ServiceDetails/Data";

export class QueryManagerResolverImpl implements QueryManagerResolver {
  private managers: QueryManager[] = [];

  constructor(
    private readonly store: Store,
    private readonly apiHelper: ApiHelper,
    private readonly scheduler: Scheduler,
    private readonly slowScheduler: Scheduler
  ) {
    this.managers = this.getManagers();
  }

  get(): QueryManager[] {
    return this.managers;
  }

  pauseContinuous(): void {
    this.scheduler.pauseTasks();
    this.slowScheduler.pauseTasks();
  }

  resumeContinuous(): void {
    this.scheduler.resumeTasks();
    this.slowScheduler.resumeTasks();
  }

  private getManagers(): QueryManager[] {
    return [
      EventsQueryManager(this.apiHelper, EventsStateHelper(this.store), this.scheduler),
      CallbacksQueryManager(this.apiHelper, CallbacksStateHelper(this.store)),
      GetAgentsQueryManager(this.store, this.apiHelper, this.scheduler),
      GetAgentsQueryManager(this.store, this.apiHelper, this.scheduler),
      GetParametersQueryManager(
        this.apiHelper,
        GetParametersStateHelper(this.store),
        this.scheduler
      ),
      GetFactsQueryManager(this.store, this.apiHelper, this.scheduler),
      GetOrdersQueryManager(this.apiHelper, GetOrdersStateHelper(this.store), this.scheduler),
      GetOrderDetailsQueryManager(this.apiHelper, this.store, this.scheduler),
      GetDryRunsQueryManager(this.apiHelper, this.store, this.scheduler),
      GetDryRunReportQueryManager(this.apiHelper, this.store),
    ];
  }
}

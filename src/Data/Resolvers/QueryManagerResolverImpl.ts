import {
  QueryManager,
  ApiHelper,
  Scheduler,
  QueryManagerResolver,
} from "@/Core";
import { Store } from "@/Data/Store";
import { GetOrdersQueryManager } from "@/Slices/Orders/Data/QueryManager";
import { GetDiscoveredResourcesQueryManager } from "@/Slices/ResourceDiscovery/Data/QueryManager";
import { GetDiscoveredResourcesStateHelper } from "@/Slices/ResourceDiscovery/Data/StateHelper";
import { GetAgentsQueryManager } from "@S/Agents/Data";
import {
  GetDryRunReportQueryManager,
  GetDryRunsQueryManager,
} from "@S/ComplianceCheck/Data";
import {
  GetDesiredStateDiffQueryManager,
  GetDesiredStateDiffStateHelper,
} from "@S/DesiredStateCompare/Data";
import {
  GetVersionResourcesQueryManager,
  GetVersionResourcesStateHelper,
} from "@S/DesiredStateDetails/Data";
import { GetDesiredStateResourceDetailsQueryManager } from "@S/DesiredStateResourceDetails/Data";
import { EventsQueryManager, EventsStateHelper } from "@S/Events/Data";
import { GetFactsQueryManager } from "@S/Facts/Data";
import { GetOrderDetailsQueryManager } from "@S/OrderDetails/Data/QueryManager";
import { GetOrdersStateHelper } from "@S/Orders/Data/StateHelper";
import {
  GetParametersQueryManager,
  GetParametersStateHelper,
} from "@S/Parameters/Data";
import { GetResourcesQueryManager } from "@S/Resource/Data";
import {
  GetResourceFactsQueryManager,
  GetResourceFactsStateHelper,
  ResourceDetailsQueryManager,
  ResourceDetailsStateHelper,
  ResourceHistoryQueryManager,
  ResourceHistoryStateHelper,
  ResourceLogsQueryManager,
  ResourceLogsStateHelper,
} from "@S/ResourceDetails/Data";
import {
  CallbacksQueryManager,
  CallbacksStateHelper,
} from "@S/ServiceDetails/Data";

export class QueryManagerResolverImpl implements QueryManagerResolver {
  private managers: QueryManager[] = [];

  constructor(
    private readonly store: Store,
    private readonly apiHelper: ApiHelper,
    private readonly scheduler: Scheduler,
    private readonly slowScheduler: Scheduler,
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
      EventsQueryManager(
        this.apiHelper,
        EventsStateHelper(this.store),
        this.scheduler,
      ),
      GetDiscoveredResourcesQueryManager(
        this.apiHelper,
        GetDiscoveredResourcesStateHelper(this.store),
        this.scheduler,
      ),
      GetResourcesQueryManager(this.store, this.apiHelper, this.scheduler),
      ResourceDetailsQueryManager(
        this.apiHelper,
        ResourceDetailsStateHelper(this.store),
        this.scheduler,
      ),
      ResourceHistoryQueryManager(
        this.apiHelper,
        ResourceHistoryStateHelper(this.store),
        this.scheduler,
      ),
      CallbacksQueryManager(this.apiHelper, CallbacksStateHelper(this.store)),
      ResourceLogsQueryManager(
        this.apiHelper,
        ResourceLogsStateHelper(this.store),
        this.scheduler,
      ),
      GetResourceFactsQueryManager(
        this.apiHelper,
        GetResourceFactsStateHelper(this.store),
        this.scheduler,
      ),
      GetAgentsQueryManager(this.store, this.apiHelper, this.scheduler),
      GetVersionResourcesQueryManager(
        this.apiHelper,
        GetVersionResourcesStateHelper(this.store),
        this.scheduler,
      ),
      GetParametersQueryManager(
        this.apiHelper,
        GetParametersStateHelper(this.store),
        this.scheduler,
      ),
      GetFactsQueryManager(this.store, this.apiHelper, this.scheduler),
      GetDesiredStateDiffQueryManager(
        this.apiHelper,
        GetDesiredStateDiffStateHelper(this.store),
      ),
      GetOrdersQueryManager(
        this.apiHelper,
        GetOrdersStateHelper(this.store),
        this.scheduler,
      ),
      GetOrderDetailsQueryManager(this.apiHelper, this.store, this.scheduler),
      GetDryRunsQueryManager(this.apiHelper, this.store, this.scheduler),
      GetDryRunReportQueryManager(this.apiHelper, this.store),
      GetDesiredStateResourceDetailsQueryManager(
        this.apiHelper,
        this.store,
        this.scheduler,
      ),
    ];
  }
}

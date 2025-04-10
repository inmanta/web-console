import { QueryManager, ApiHelper, Scheduler, QueryManagerResolver } from "@/Core";
import {
  GetServerStatusOneTimeQueryManager,
  GetServerStatusContinuousQueryManager,
  GetServerStatusStateHelper,
  GetEnvironmentSettingsQueryManager,
  GetEnvironmentSettingsStateHelper,
  GetEnvironmentsQueryManager,
  GetEnvironmentsStateHelper,
} from "@/Data/Managers";
import { Store } from "@/Data/Store";
import { GetOrdersQueryManager } from "@/Slices/Orders/Data/QueryManager";
import { GetDiscoveredResourcesQueryManager } from "@/Slices/ResourceDiscovery/Data/QueryManager";
import { GetDiscoveredResourcesStateHelper } from "@/Slices/ResourceDiscovery/Data/StateHelper";
import {
  EnvironmentDetailsContinuousQueryManager,
  EnvironmentDetailsOneTimeQueryManager,
} from "@/Slices/Settings/Data/GetEnvironmentDetails";
import { GetProjectsQueryManager } from "@/Slices/Settings/Data/GetProjects";
import { GetAgentsQueryManager } from "@S/Agents/Data";
import { GetDryRunReportQueryManager, GetDryRunsQueryManager } from "@S/ComplianceCheck/Data";
import { EventsQueryManager, EventsStateHelper } from "@S/Events/Data";
import { GetFactsQueryManager } from "@S/Facts/Data";
import { GetOrderDetailsQueryManager } from "@S/OrderDetails/Data/QueryManager";
import { GetOrdersStateHelper } from "@S/Orders/Data/StateHelper";
import { GetParametersQueryManager, GetParametersStateHelper } from "@S/Parameters/Data";
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
import { CallbacksQueryManager, CallbacksStateHelper } from "@S/ServiceDetails/Data";
import {
  GetEnvironmentsContinuousQueryManager,
  GetEnvironmentsContinuousStateHelper,
} from "../Managers/GetEnvironmentsContinuous";

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
      GetProjectsQueryManager(this.store, this.apiHelper),
      GetEnvironmentsContinuousQueryManager(
        this.apiHelper,
        this.scheduler,
        GetEnvironmentsContinuousStateHelper(this.store)
      ),
      GetEnvironmentsQueryManager(this.apiHelper, GetEnvironmentsStateHelper(this.store)),
      GetServerStatusOneTimeQueryManager(this.apiHelper, GetServerStatusStateHelper(this.store)),
      GetServerStatusContinuousQueryManager(
        this.apiHelper,
        GetServerStatusStateHelper(this.store),
        this.slowScheduler
      ),
      GetEnvironmentSettingsQueryManager(
        this.apiHelper,
        GetEnvironmentSettingsStateHelper(this.store)
      ),
      EventsQueryManager(this.apiHelper, EventsStateHelper(this.store), this.scheduler),
      GetDiscoveredResourcesQueryManager(
        this.apiHelper,
        GetDiscoveredResourcesStateHelper(this.store),
        this.scheduler
      ),
      GetResourcesQueryManager(this.store, this.apiHelper, this.scheduler),
      ResourceDetailsQueryManager(
        this.apiHelper,
        ResourceDetailsStateHelper(this.store),
        this.scheduler
      ),
      ResourceHistoryQueryManager(
        this.apiHelper,
        ResourceHistoryStateHelper(this.store),
        this.scheduler
      ),
      EnvironmentDetailsContinuousQueryManager(this.store, this.apiHelper, this.scheduler),
      EnvironmentDetailsOneTimeQueryManager(this.store, this.apiHelper),
      CallbacksQueryManager(this.apiHelper, CallbacksStateHelper(this.store)),
      ResourceLogsQueryManager(this.apiHelper, ResourceLogsStateHelper(this.store), this.scheduler),
      GetResourceFactsQueryManager(
        this.apiHelper,
        GetResourceFactsStateHelper(this.store),
        this.scheduler
      ),
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

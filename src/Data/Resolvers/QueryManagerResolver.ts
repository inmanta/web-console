import { QueryManager, ManagerResolver, ApiHelper, Scheduler } from "@/Core";
import {
  ServiceQueryManager,
  ServiceKeyMaker,
  ServiceStateHelper,
  ServiceInstancesQueryManager,
  ServiceInstancesStateHelper,
  InstanceResourcesStateHelper,
  InstanceResourcesQueryManager,
  ServicesQueryManager,
  ServicesStateHelper,
  InstanceConfigQueryManager,
  InstanceConfigStateHelper,
  InstanceConfigFinalizer,
  ServiceConfigQueryManager,
  ServiceConfigStateHelper,
  ServiceConfigFinalizer,
  ResourceDetailsQueryManager,
  ResourceDetailsStateHelper,
  ResourceHistoryStateHelper,
  ResourceHistoryQueryManager,
  ServiceInstanceQueryManager,
  ServiceInstanceStateHelper,
  CallbacksQueryManager,
  CallbacksStateHelper,
  ResourceLogsQueryManager,
  ResourceLogsStateHelper,
  GetServerStatusOneTimeQueryManager,
  GetServerStatusContinuousQueryManager,
  GetServerStatusStateHelper,
  GetEnvironmentSettingsQueryManager,
  GetEnvironmentSettingsStateHelper,
  GetEnvironmentsQueryManager,
  GetEnvironmentsStateHelper,
  GetResourceFactsQueryManager,
  GetResourceFactsStateHelper,
  GetVersionResourcesQueryManager,
  GetVersionResourcesStateHelper,
  GetCompilerStatusQueryManager,
  GetParametersQueryManager,
  GetParametersStateHelper,
  GetDesiredStatesQueryManager,
  GetDesiredStatesStateHelper,
  GetDesiredStateDiffQueryManager,
  GetDesiredStateDiffStateHelper,
  GetVersionedResourceDetails,
} from "@/Data/Managers";
import { Store } from "@/Data/Store";
import {
  EnvironmentDetailsContinuousQueryManager,
  EnvironmentDetailsOneTimeQueryManager,
} from "@/Slices/Settings/Data/GetEnvironmentDetails";
import { GetProjectsQueryManager } from "@/Slices/Settings/Data/GetProjects";
import { GetAgentProcessQueryManager } from "@S/AgentProcess/Data";
import { GetAgentsQueryManager } from "@S/Agents/Data";
import { CompileDetailsQueryManager } from "@S/CompileDetails/Data";
import { CompileReportsQueryManager } from "@S/CompileReports/Data";
import {
  GetDryRunReportQueryManager,
  GetDryRunsQueryManager,
} from "@S/ComplianceCheck/Data";
import {
  DiagnosticsQueryManager,
  DiagnosticsStateHelper,
} from "@S/Diagnose/Data";
import { EventsQueryManager, EventsStateHelper } from "@S/Events/Data";
import { GetFactsQueryManager } from "@S/Facts/Data";
import {
  NotificationContinuousQueryManager,
  NotificationReadOnlyQueryManager,
} from "@S/Notification/Data";
import { GetResourcesQueryManager } from "@S/Resource/Data";
import {
  GetInstanceLogsQueryManager,
  GetInstanceLogsStateHelper,
} from "@S/ServiceInstanceHistory/Data";

export class QueryManagerResolver implements ManagerResolver<QueryManager> {
  private managers: QueryManager[] = [];

  constructor(
    private readonly store: Store,
    private readonly apiHelper: ApiHelper,
    private readonly scheduler: Scheduler,
    private readonly slowScheduler: Scheduler,
    private readonly instanceResourcesRetryLimit: number = 20
  ) {
    this.managers = this.getManagers();
  }

  get(): QueryManager[] {
    return this.managers;
  }

  private getManagers(): QueryManager[] {
    const serviceKeyMaker = new ServiceKeyMaker();
    const serviceStateHelper = new ServiceStateHelper(
      this.store,
      serviceKeyMaker
    );
    const serviceInstancesStateHelper = new ServiceInstancesStateHelper(
      this.store
    );

    return [
      new GetProjectsQueryManager(this.store, this.apiHelper),
      new GetEnvironmentsQueryManager(
        this.apiHelper,
        new GetEnvironmentsStateHelper(this.store)
      ),
      new GetServerStatusOneTimeQueryManager(
        this.apiHelper,
        new GetServerStatusStateHelper(this.store)
      ),
      new GetServerStatusContinuousQueryManager(
        this.apiHelper,
        new GetServerStatusStateHelper(this.store),
        this.slowScheduler
      ),
      new GetEnvironmentSettingsQueryManager(
        this.apiHelper,
        new GetEnvironmentSettingsStateHelper(this.store)
      ),
      new ServicesQueryManager(
        this.apiHelper,
        new ServicesStateHelper(this.store),
        this.scheduler
      ),
      new ServiceQueryManager(
        this.apiHelper,
        serviceStateHelper,
        this.scheduler,
        serviceKeyMaker
      ),
      new ServiceInstancesQueryManager(
        this.apiHelper,
        serviceInstancesStateHelper,
        this.scheduler
      ),
      new ServiceConfigQueryManager(
        this.apiHelper,
        new ServiceConfigStateHelper(this.store),
        new ServiceConfigFinalizer(serviceStateHelper)
      ),
      new InstanceResourcesQueryManager(
        this.apiHelper,
        new InstanceResourcesStateHelper(this.store),
        serviceInstancesStateHelper,
        this.scheduler,
        this.instanceResourcesRetryLimit
      ),
      new EventsQueryManager(
        this.apiHelper,
        new EventsStateHelper(this.store),
        this.scheduler
      ),
      new GetInstanceLogsQueryManager(
        this.apiHelper,
        new GetInstanceLogsStateHelper(this.store),
        this.scheduler
      ),
      new InstanceConfigQueryManager(
        this.apiHelper,
        new InstanceConfigStateHelper(this.store),
        new InstanceConfigFinalizer(serviceStateHelper)
      ),
      new DiagnosticsQueryManager(
        this.apiHelper,
        new DiagnosticsStateHelper(this.store),
        this.scheduler
      ),
      new GetResourcesQueryManager(this.store, this.apiHelper, this.scheduler),
      new ResourceDetailsQueryManager(
        this.apiHelper,
        new ResourceDetailsStateHelper(this.store),
        this.scheduler
      ),
      new ResourceHistoryQueryManager(
        this.apiHelper,
        new ResourceHistoryStateHelper(this.store),
        this.scheduler
      ),
      new EnvironmentDetailsContinuousQueryManager(
        this.store,
        this.apiHelper,
        this.scheduler
      ),
      new EnvironmentDetailsOneTimeQueryManager(this.store, this.apiHelper),
      new ServiceInstanceQueryManager(
        this.apiHelper,
        new ServiceInstanceStateHelper(this.store),
        this.scheduler
      ),
      new CallbacksQueryManager(
        this.apiHelper,
        new CallbacksStateHelper(this.store)
      ),
      new CompileReportsQueryManager(
        this.store,
        this.apiHelper,
        this.scheduler
      ),
      new CompileDetailsQueryManager(
        this.store,
        this.apiHelper,

        this.scheduler
      ),
      new ResourceLogsQueryManager(
        this.apiHelper,
        new ResourceLogsStateHelper(this.store),
        this.scheduler
      ),
      new GetResourceFactsQueryManager(
        this.apiHelper,
        new GetResourceFactsStateHelper(this.store),
        this.scheduler
      ),
      new GetAgentsQueryManager(this.store, this.apiHelper, this.scheduler),
      new GetAgentProcessQueryManager(this.store, this.apiHelper),
      new GetDesiredStatesQueryManager(
        this.apiHelper,
        new GetDesiredStatesStateHelper(this.store),
        this.scheduler
      ),
      new GetVersionResourcesQueryManager(
        this.apiHelper,
        new GetVersionResourcesStateHelper(this.store),
        this.scheduler
      ),
      new GetCompilerStatusQueryManager(this.apiHelper, this.scheduler),
      new GetParametersQueryManager(
        this.apiHelper,
        new GetParametersStateHelper(this.store),
        this.scheduler
      ),
      new GetFactsQueryManager(this.store, this.apiHelper, this.scheduler),
      new GetDesiredStateDiffQueryManager(
        this.apiHelper,
        new GetDesiredStateDiffStateHelper(this.store)
      ),
      new GetDryRunsQueryManager(this.apiHelper, this.store, this.scheduler),
      new GetDryRunReportQueryManager(this.apiHelper, this.store),
      new GetVersionedResourceDetails.QueryManager(
        this.apiHelper,
        this.store,
        this.scheduler
      ),
      new NotificationContinuousQueryManager(
        this.apiHelper,
        this.store,
        this.scheduler
      ),
      new NotificationReadOnlyQueryManager(this.store),
    ];
  }
}

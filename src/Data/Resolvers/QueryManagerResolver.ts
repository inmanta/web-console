import { QueryManager, ManagerResolver, ApiHelper, Scheduler } from "@/Core";
import {
  GetProjectsQueryManager,
  GetProjectsStateHelper,
  ServiceQueryManager,
  ServiceKeyMaker,
  ServiceStateHelper,
  ServiceInstancesQueryManager,
  ServiceInstancesStateHelper,
  InstanceResourcesStateHelper,
  InstanceResourcesQueryManager,
  EventsQueryManager,
  EventsStateHelper,
  ServicesQueryManager,
  ServicesStateHelper,
  GetInstanceLogsQueryManager,
  GetInstanceLogsStateHelper,
  InstanceConfigQueryManager,
  InstanceConfigStateHelper,
  InstanceConfigFinalizer,
  DiagnosticsStateHelper,
  DiagnosticsQueryManager,
  ServiceConfigQueryManager,
  ServiceConfigStateHelper,
  ServiceConfigFinalizer,
  ResourceDetailsQueryManager,
  ResourceDetailsStateHelper,
  ResourceHistoryStateHelper,
  ResourceHistoryQueryManager,
  EnvironmentDetailsQueryManager,
  EnvironmentDetailsOneTimeQueryManager,
  EnvironmentDetailsStateHelper,
  ServiceInstanceQueryManager,
  ServiceInstanceStateHelper,
  CallbacksQueryManager,
  CallbacksStateHelper,
  CompileReportsQueryManager,
  CompileReportsStateHelper,
  CompileDetailsQueryManager,
  CompileDetailsStateHelper,
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
  GetAgentsQueryManager,
  GetAgentsStateHelper,
  GetVersionResourcesQueryManager,
  GetVersionResourcesStateHelper,
  GetCompilerStatusQueryManager,
  GetParametersQueryManager,
  GetParametersStateHelper,
  GetFactsQueryManager,
  GetDesiredStatesQueryManager,
  GetDesiredStatesStateHelper,
  GetFactsStateHelper,
  GetDesiredStateDiffQueryManager,
  GetDesiredStateDiffStateHelper,
  GetDryRuns,
  GetDryRunReport,
  GetVersionedResourceDetails,
} from "@/Data/Managers";
import { Store } from "@/Data/Store";
import * as Agent from "@S/Agent/Data";
import * as Notification from "@S/Notification/Data";
import * as Resource from "@S/Resource/Data";

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
      new GetProjectsQueryManager(
        this.apiHelper,
        new GetProjectsStateHelper(this.store)
      ),
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
      new Resource.GetResourcesQueryManager(
        this.apiHelper,
        new Resource.GetResourcesStateHelper(this.store),
        this.scheduler
      ),
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
      new EnvironmentDetailsQueryManager(
        this.apiHelper,
        new EnvironmentDetailsStateHelper(this.store),
        this.scheduler
      ),
      new EnvironmentDetailsOneTimeQueryManager(
        this.apiHelper,
        new EnvironmentDetailsStateHelper(this.store)
      ),
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
        this.apiHelper,
        new CompileReportsStateHelper(this.store),
        this.scheduler
      ),
      new CompileDetailsQueryManager(
        this.apiHelper,
        new CompileDetailsStateHelper(this.store),
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
      new GetAgentsQueryManager(
        this.apiHelper,
        new GetAgentsStateHelper(this.store),
        this.scheduler
      ),
      new Agent.GetAgentProcessQueryManager(
        this.apiHelper,
        new Agent.GetAgentProcessStateHelper(this.store)
      ),
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
      new GetFactsQueryManager(
        this.apiHelper,
        new GetFactsStateHelper(this.store),
        this.scheduler
      ),
      new GetDesiredStateDiffQueryManager(
        this.apiHelper,
        new GetDesiredStateDiffStateHelper(this.store)
      ),
      new GetDryRuns.QueryManager(this.apiHelper, this.store, this.scheduler),
      new GetDryRunReport.QueryManager(this.apiHelper, this.store),
      new GetVersionedResourceDetails.QueryManager(
        this.apiHelper,
        this.store,
        this.scheduler
      ),
      new Notification.ContinuousManager(
        this.apiHelper,
        this.store,
        this.scheduler
      ),
      new Notification.ReadOnlyManager(this.store),
    ];
  }
}

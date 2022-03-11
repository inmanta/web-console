import {
  QueryManager,
  ManagerResolver,
  SchedulerImpl,
  ApiHelper,
} from "@/Core";
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
  ResourcesQueryManager,
  ResourcesStateHelper,
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
  GetFactsQueryManager,
  GetFactsStateHelper,
  GetAgentsQueryManager,
  GetAgentsStateHelper,
  GetAgentProcessQueryManager,
  GetAgentProcessStateHelper,
  GetVersionResourcesQueryManager,
  GetVersionResourcesStateHelper,
  GetCompilerStatusQueryManager,
  GetVersionedResourceDetails,
} from "@/Data/Managers";
import { Store } from "@/Data/Store";
import {
  GetDesiredStatesQueryManager,
  GetDesiredStatesStateHelper,
} from "../Managers/GetDesiredStates";

export class QueryManagerResolver implements ManagerResolver<QueryManager> {
  private managers: QueryManager[] = [];

  constructor(
    private readonly store: Store,
    private readonly apiHelper: ApiHelper
  ) {
    this.managers = this.getManagers();
  }

  get(): QueryManager[] {
    return this.managers;
  }

  private getManagers(): QueryManager[] {
    const serviceKeyMaker = new ServiceKeyMaker();
    const scheduler = new SchedulerImpl(5000);
    const serviceStateHelper = new ServiceStateHelper(
      this.store,
      serviceKeyMaker
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
        new SchedulerImpl(10000)
      ),
      new GetEnvironmentSettingsQueryManager(
        this.apiHelper,
        new GetEnvironmentSettingsStateHelper(this.store)
      ),
      new ServicesQueryManager(
        this.apiHelper,
        new ServicesStateHelper(this.store),
        scheduler
      ),
      new ServiceQueryManager(
        this.apiHelper,
        serviceStateHelper,
        scheduler,
        serviceKeyMaker
      ),
      new ServiceInstancesQueryManager(
        this.apiHelper,
        new ServiceInstancesStateHelper(this.store),
        scheduler
      ),
      new ServiceConfigQueryManager(
        this.apiHelper,
        new ServiceConfigStateHelper(this.store),
        new ServiceConfigFinalizer(serviceStateHelper)
      ),
      new InstanceResourcesQueryManager(
        this.apiHelper,
        new InstanceResourcesStateHelper(this.store),
        scheduler
      ),
      new EventsQueryManager(
        this.apiHelper,
        new EventsStateHelper(this.store),
        scheduler
      ),
      new GetInstanceLogsQueryManager(
        this.apiHelper,
        new GetInstanceLogsStateHelper(this.store),
        scheduler
      ),
      new InstanceConfigQueryManager(
        this.apiHelper,
        new InstanceConfigStateHelper(this.store),
        new InstanceConfigFinalizer(serviceStateHelper)
      ),
      new DiagnosticsQueryManager(
        this.apiHelper,
        new DiagnosticsStateHelper(this.store),
        scheduler
      ),
      new ResourcesQueryManager(
        this.apiHelper,
        new ResourcesStateHelper(this.store),
        scheduler
      ),
      new ResourceDetailsQueryManager(
        this.apiHelper,
        new ResourceDetailsStateHelper(this.store),
        scheduler
      ),
      new ResourceHistoryQueryManager(
        this.apiHelper,
        new ResourceHistoryStateHelper(this.store),
        scheduler
      ),
      new EnvironmentDetailsQueryManager(
        this.apiHelper,
        new EnvironmentDetailsStateHelper(this.store),
        scheduler
      ),
      new EnvironmentDetailsOneTimeQueryManager(
        this.apiHelper,
        new EnvironmentDetailsStateHelper(this.store)
      ),
      new ServiceInstanceQueryManager(
        this.apiHelper,
        new ServiceInstanceStateHelper(this.store),
        scheduler
      ),
      new CallbacksQueryManager(
        this.apiHelper,
        new CallbacksStateHelper(this.store)
      ),
      new CompileReportsQueryManager(
        this.apiHelper,
        new CompileReportsStateHelper(this.store),
        scheduler
      ),
      new CompileDetailsQueryManager(
        this.apiHelper,
        new CompileDetailsStateHelper(this.store),
        scheduler
      ),
      new ResourceLogsQueryManager(
        this.apiHelper,
        new ResourceLogsStateHelper(this.store),
        scheduler
      ),
      new GetFactsQueryManager(
        this.apiHelper,
        new GetFactsStateHelper(this.store),
        scheduler
      ),
      new GetAgentsQueryManager(
        this.apiHelper,
        new GetAgentsStateHelper(this.store),
        scheduler
      ),
      new GetAgentProcessQueryManager(
        this.apiHelper,
        new GetAgentProcessStateHelper(this.store)
      ),
      new GetDesiredStatesQueryManager(
        this.apiHelper,
        new GetDesiredStatesStateHelper(this.store),
        scheduler
      ),
      new GetVersionResourcesQueryManager(
        this.apiHelper,
        new GetVersionResourcesStateHelper(this.store),
        scheduler
      ),
      new GetCompilerStatusQueryManager(this.apiHelper, scheduler),
      new GetVersionedResourceDetails.QueryManager(
        this.apiHelper,
        this.store,
        scheduler
      ),
    ];
  }
}

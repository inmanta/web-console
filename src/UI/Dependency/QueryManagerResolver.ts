import { QueryManager, ManagerResolver, SchedulerImpl } from "@/Core";
import {
  BaseApiHelper,
  ProjectsQueryManager,
  ProjectsStateHelper,
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
  InstanceLogsQueryManager,
  InstanceLogsStateHelper,
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
  Store,
  ResourceDetailsQueryManager,
  ResourceDetailsStateHelper,
  ResourceHistoryStateHelper,
  ResourceHistoryQueryManager,
  EnvironmentDetailsQueryManager,
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
  GetServerStatusQueryManager,
  GetServerStatusStateHelper,
  GetEnvironmentSettingsQueryManager,
  GetEnvironmentSettingsStateHelper,
} from "@/Data";

export class QueryManagerResolver implements ManagerResolver<QueryManager> {
  private managers: QueryManager[] = [];

  constructor(
    private readonly store: Store,
    private readonly apiHelper: BaseApiHelper
  ) {
    this.managers = this.getIndependentManagers();
  }

  get(): QueryManager[] {
    return this.managers;
  }

  resolve(env: string): void {
    this.managers = [
      ...this.getIndependentManagers(),
      ...this.getEnvDependentManagers(env),
    ];
  }

  private getIndependentManagers(): QueryManager[] {
    return [
      new ProjectsQueryManager(
        this.apiHelper,
        new ProjectsStateHelper(this.store)
      ),
      new GetServerStatusQueryManager(
        this.apiHelper,
        new GetServerStatusStateHelper(this.store)
      ),
    ];
  }

  private getEnvDependentManagers(environment: string): QueryManager[] {
    const serviceKeyMaker = new ServiceKeyMaker();
    const scheduler = new SchedulerImpl(5000);
    const serviceStateHelper = new ServiceStateHelper(
      this.store,
      serviceKeyMaker,
      environment
    );

    return [
      new GetEnvironmentSettingsQueryManager(
        this.apiHelper,
        new GetEnvironmentSettingsStateHelper(this.store, environment),
        environment
      ),
      new ServicesQueryManager(
        this.apiHelper,
        new ServicesStateHelper(this.store, environment),
        scheduler,
        environment
      ),
      new ServiceQueryManager(
        this.apiHelper,
        serviceStateHelper,
        scheduler,
        serviceKeyMaker,
        environment
      ),
      new ServiceInstancesQueryManager(
        this.apiHelper,
        new ServiceInstancesStateHelper(this.store, environment),
        scheduler,
        environment
      ),
      new ServiceConfigQueryManager(
        this.apiHelper,
        new ServiceConfigStateHelper(this.store),
        new ServiceConfigFinalizer(serviceStateHelper),
        environment
      ),
      new InstanceResourcesQueryManager(
        this.apiHelper,
        new InstanceResourcesStateHelper(this.store),
        scheduler,
        environment
      ),
      new EventsQueryManager(
        this.apiHelper,
        new EventsStateHelper(this.store),
        scheduler,
        environment
      ),
      new InstanceLogsQueryManager(
        this.apiHelper,
        new InstanceLogsStateHelper(this.store),
        environment
      ),
      new InstanceConfigQueryManager(
        this.apiHelper,
        new InstanceConfigStateHelper(this.store),
        new InstanceConfigFinalizer(serviceStateHelper),
        environment
      ),
      new DiagnosticsQueryManager(
        this.apiHelper,
        new DiagnosticsStateHelper(this.store),
        scheduler,
        environment
      ),
      new ResourcesQueryManager(
        this.apiHelper,
        new ResourcesStateHelper(this.store, environment),
        scheduler,
        environment
      ),
      new ResourceDetailsQueryManager(
        this.apiHelper,
        new ResourceDetailsStateHelper(this.store),
        scheduler,
        environment
      ),
      new ResourceHistoryQueryManager(
        this.apiHelper,
        new ResourceHistoryStateHelper(this.store),
        scheduler,
        environment
      ),
      new EnvironmentDetailsQueryManager(
        this.apiHelper,
        new EnvironmentDetailsStateHelper(this.store, environment),
        scheduler,
        environment
      ),
      new ServiceInstanceQueryManager(
        this.apiHelper,
        new ServiceInstanceStateHelper(this.store),
        scheduler,
        environment
      ),
      new CallbacksQueryManager(
        this.apiHelper,
        new CallbacksStateHelper(this.store, environment),
        environment
      ),
      new CompileReportsQueryManager(
        this.apiHelper,
        new CompileReportsStateHelper(this.store, environment),
        scheduler,
        environment
      ),
      new CompileDetailsQueryManager(
        this.apiHelper,
        new CompileDetailsStateHelper(this.store),
        scheduler,
        environment
      ),
      new ResourceLogsQueryManager(
        this.apiHelper,
        new ResourceLogsStateHelper(this.store),
        scheduler,
        environment
      ),
    ];
  }
}

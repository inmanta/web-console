import { QueryManager, ManagerResolver, SchedulerImpl } from "@/Core";
import {
  BaseApiHelper,
  FetcherImpl,
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
} from "@/Data";

export class QueryManagerResolver implements ManagerResolver<QueryManager> {
  private managers: QueryManager[] = [];

  constructor(
    private readonly store: Store,
    private readonly baseApiHelper: BaseApiHelper
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
        new FetcherImpl<"GetProjects">(this.baseApiHelper),
        new ProjectsStateHelper(this.store)
      ),
      new GetServerStatusQueryManager(
        new FetcherImpl<"GetServerStatus">(this.baseApiHelper),
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
    const serviceFetcher = new FetcherImpl<"GetService">(this.baseApiHelper);

    return [
      new ServicesQueryManager(
        new FetcherImpl<"GetServices">(this.baseApiHelper),
        new ServicesStateHelper(this.store, environment),
        scheduler,
        environment
      ),
      new ServiceQueryManager(
        serviceFetcher,
        serviceStateHelper,
        scheduler,
        serviceKeyMaker,
        environment
      ),
      new ServiceInstancesQueryManager(
        this.baseApiHelper,
        new ServiceInstancesStateHelper(this.store, environment),
        scheduler,
        environment
      ),
      new ServiceConfigQueryManager(
        new FetcherImpl<"GetServiceConfig">(this.baseApiHelper),
        new ServiceConfigStateHelper(this.store),
        new ServiceConfigFinalizer(serviceStateHelper),
        environment
      ),
      new InstanceResourcesQueryManager(
        new FetcherImpl<"GetInstanceResources">(this.baseApiHelper),
        new InstanceResourcesStateHelper(this.store),
        scheduler,
        environment
      ),
      new EventsQueryManager(
        new FetcherImpl<"GetInstanceEvents">(this.baseApiHelper),
        new EventsStateHelper(this.store),
        scheduler,
        environment
      ),
      new InstanceLogsQueryManager(
        new FetcherImpl<"GetInstanceLogs">(this.baseApiHelper),
        new InstanceLogsStateHelper(this.store),
        environment
      ),
      new InstanceConfigQueryManager(
        new FetcherImpl<"GetInstanceConfig">(this.baseApiHelper),
        new InstanceConfigStateHelper(this.store),
        new InstanceConfigFinalizer(serviceStateHelper),
        environment
      ),
      new DiagnosticsQueryManager(
        new FetcherImpl<"GetDiagnostics">(this.baseApiHelper),
        new DiagnosticsStateHelper(this.store),
        scheduler,
        environment
      ),
      new ResourcesQueryManager(
        new FetcherImpl<"GetResources">(this.baseApiHelper),
        new ResourcesStateHelper(this.store, environment),
        scheduler,
        environment
      ),
      new ResourceDetailsQueryManager(
        new FetcherImpl<"GetResourceDetails">(this.baseApiHelper),
        new ResourceDetailsStateHelper(this.store),
        scheduler,
        environment
      ),
      new ResourceHistoryQueryManager(
        new FetcherImpl<"GetResourceHistory">(this.baseApiHelper),
        new ResourceHistoryStateHelper(this.store),
        scheduler,
        environment
      ),
      new EnvironmentDetailsQueryManager(
        new FetcherImpl<"GetEnvironmentDetails">(this.baseApiHelper),
        new EnvironmentDetailsStateHelper(this.store, environment),
        scheduler,
        environment
      ),
      new ServiceInstanceQueryManager(
        new FetcherImpl<"GetServiceInstance">(this.baseApiHelper),
        new ServiceInstanceStateHelper(this.store),
        scheduler,
        environment
      ),
      new CallbacksQueryManager(
        new FetcherImpl<"GetCallbacks">(this.baseApiHelper),
        new CallbacksStateHelper(this.store, environment),
        environment
      ),
      new CompileReportsQueryManager(
        new FetcherImpl<"GetCompileReports">(this.baseApiHelper),
        new CompileReportsStateHelper(this.store, environment),
        scheduler,
        environment
      ),
      new CompileDetailsQueryManager(
        new FetcherImpl<"GetCompileDetails">(this.baseApiHelper),
        new CompileDetailsStateHelper(this.store),
        scheduler,
        environment
      ),
      new ResourceLogsQueryManager(
        new FetcherImpl<"GetResourceLogs">(this.baseApiHelper),
        new ResourceLogsStateHelper(this.store),
        scheduler,
        environment
      ),
    ];
  }
}

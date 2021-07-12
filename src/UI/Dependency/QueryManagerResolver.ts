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
    const stateHelper = new ProjectsStateHelper(this.store);
    const projectsManager = new ProjectsQueryManager(
      new FetcherImpl<"Projects">(this.baseApiHelper),
      stateHelper
    );
    return [projectsManager];
  }

  private getEnvDependentManagers(environment: string): QueryManager[] {
    const serviceKeyMaker = new ServiceKeyMaker();
    const scheduler = new SchedulerImpl(5000);
    const serviceStateHelper = new ServiceStateHelper(
      this.store,
      serviceKeyMaker,
      environment
    );
    const serviceFetcher = new FetcherImpl<"Service">(this.baseApiHelper);

    return [
      new ServicesQueryManager(
        new FetcherImpl<"Services">(this.baseApiHelper),
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
        new FetcherImpl<"ServiceInstances">(this.baseApiHelper),
        new ServiceInstancesStateHelper(this.store, environment),
        scheduler,
        environment
      ),
      new ServiceConfigQueryManager(
        new FetcherImpl<"ServiceConfig">(this.baseApiHelper),
        new ServiceConfigStateHelper(this.store),
        new ServiceConfigFinalizer(serviceStateHelper),
        environment
      ),
      new InstanceResourcesQueryManager(
        new FetcherImpl<"InstanceResources">(this.baseApiHelper),
        new InstanceResourcesStateHelper(this.store),
        scheduler,
        environment
      ),
      new EventsQueryManager(
        new FetcherImpl<"Events">(this.baseApiHelper),
        new EventsStateHelper(this.store),
        scheduler,
        environment
      ),
      new InstanceLogsQueryManager(
        new FetcherImpl<"InstanceLogs">(this.baseApiHelper),
        new InstanceLogsStateHelper(this.store),
        environment
      ),
      new InstanceConfigQueryManager(
        new FetcherImpl<"InstanceConfig">(this.baseApiHelper),
        new InstanceConfigStateHelper(this.store),
        new InstanceConfigFinalizer(serviceStateHelper),
        environment
      ),
      new DiagnosticsQueryManager(
        new FetcherImpl<"Diagnostics">(this.baseApiHelper),
        new DiagnosticsStateHelper(this.store),
        scheduler,
        environment
      ),
      new ResourcesQueryManager(
        new FetcherImpl<"Resources">(this.baseApiHelper),
        new ResourcesStateHelper(this.store, environment),
        scheduler,
        environment
      ),
      new ResourceDetailsQueryManager(
        new FetcherImpl<"ResourceDetails">(this.baseApiHelper),
        new ResourceDetailsStateHelper(this.store),
        scheduler,
        environment
      ),
    ];
  }
}

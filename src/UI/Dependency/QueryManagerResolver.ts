import { QueryManager, ManagerResolver, SchedulerImpl } from "@/Core";
import { BaseApiHelper, FetcherImpl } from "@/Infra";
import { ProjectsQueryManager, ProjectsStateHelper } from "@/UI/Data";
import { Store } from "@/UI/Store";
import {
  ServiceQueryManager,
  ServiceKeyMaker,
  ServiceStateHelper,
  ServiceInstancesQueryManager,
  ServiceInstancesStateHelper,
  ResourcesStateHelper,
  ResourcesQueryManager,
  EventsQueryManager,
  EventsStateHelper,
  ServicesQueryManager,
  ServicesStateHelper,
  InstanceLogsQueryManager,
  InstanceLogsStateHelper,
  InstanceConfigQueryManager,
  InstanceConfigStateHelper,
  DiagnosticsStateHelper,
  DiagnosticsQueryManager,
} from "@/UI/Data";

export class QueryManagerResolver implements ManagerResolver<QueryManager> {
  private managers: QueryManager[] = [];

  constructor(
    private readonly store: Store,
    private readonly baseApiHelper: BaseApiHelper,
    private readonly timezone: string
  ) {
    this.managers = this.getIndependentManagers();
  }

  get(): QueryManager[] {
    return this.managers;
  }

  resolve(env: string): void {
    this.managers = [...this.managers, ...this.getEnvDependentManagers(env)];
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

    return [
      new ServicesQueryManager(
        new FetcherImpl<"Services">(this.baseApiHelper),
        new ServicesStateHelper(this.store, environment),
        scheduler,
        environment
      ),
      new ServiceQueryManager(
        new FetcherImpl<"Service">(this.baseApiHelper),
        new ServiceStateHelper(this.store, serviceKeyMaker, environment),
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
      new ResourcesQueryManager(
        new FetcherImpl<"Resources">(this.baseApiHelper),
        new ResourcesStateHelper(this.store),
        scheduler,
        environment
      ),
      new EventsQueryManager(
        new FetcherImpl<"Events">(this.baseApiHelper),
        new EventsStateHelper(this.store),
        scheduler,
        environment,
        this.timezone
      ),
      new InstanceLogsQueryManager(
        new FetcherImpl<"InstanceLogs">(this.baseApiHelper),
        new InstanceLogsStateHelper(this.store),
        environment
      ),
      new InstanceConfigQueryManager(
        new FetcherImpl<"InstanceConfig">(this.baseApiHelper),
        new InstanceConfigStateHelper(this.store),
        new ServiceStateHelper(this.store, serviceKeyMaker, environment),
        new FetcherImpl<"Service">(this.baseApiHelper),
        environment
      ),
      new DiagnosticsQueryManager(
        new FetcherImpl<"Diagnostics">(this.baseApiHelper),
        new DiagnosticsStateHelper(this.store),
        scheduler,
        environment
      ),
    ];
  }
}

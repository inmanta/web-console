import { DataManager, ManagerResolver, SchedulerImpl } from "@/Core";
import { BaseApiHelper, FetcherImpl } from "@/Infra";
import { ProjectsDataManager, ProjectsStateHelper } from "@/UI/Data";
import { Store } from "@/UI/Store";
import {
  ServiceDataManager,
  ServiceKeyMaker,
  ServiceStateHelper,
  ServiceInstancesDataManager,
  ServiceInstancesStateHelper,
  ResourcesStateHelper,
  ResourcesDataManager,
  EventsDataManager,
  EventsStateHelper,
  ServicesDataManager,
  ServicesStateHelper,
  InstanceLogsDataManager,
  InstanceLogsStateHelper,
  InstanceConfigDataManager,
  InstanceConfigStateHelper,
  DiagnosticsStateHelper,
  DiagnosticsDataManager,
} from "@/UI/Data";

export class DataManagerResolver implements ManagerResolver<DataManager> {
  private managers: DataManager[] = [];

  constructor(
    private readonly store: Store,
    private readonly baseApiHelper: BaseApiHelper
  ) {
    this.managers = this.getIndependentManagers();
  }

  get(): DataManager[] {
    return this.managers;
  }

  resolve(env: string): void {
    this.managers = [...this.managers, ...this.getEnvDependentManagers(env)];
  }

  private getIndependentManagers(): DataManager[] {
    const stateHelper = new ProjectsStateHelper(this.store);
    const projectsManager = new ProjectsDataManager(
      new FetcherImpl<"Projects">(this.baseApiHelper),
      stateHelper
    );
    return [projectsManager];
  }

  private getEnvDependentManagers(environment: string): DataManager[] {
    const serviceKeyMaker = new ServiceKeyMaker();
    const scheduler = new SchedulerImpl(5000);

    const servicesHelper = new ServicesDataManager(
      new FetcherImpl<"Services">(this.baseApiHelper),
      new ServicesStateHelper(this.store, environment),
      scheduler,
      environment
    );

    const serviceHelper = new ServiceDataManager(
      new FetcherImpl<"Service">(this.baseApiHelper),
      new ServiceStateHelper(this.store, serviceKeyMaker, environment),
      scheduler,
      serviceKeyMaker,
      environment
    );

    const serviceInstancesHelper = new ServiceInstancesDataManager(
      new FetcherImpl<"ServiceInstances">(this.baseApiHelper),
      new ServiceInstancesStateHelper(this.store, environment),
      scheduler,
      environment
    );

    const resourcesHelper = new ResourcesDataManager(
      new FetcherImpl<"Resources">(this.baseApiHelper),
      new ResourcesStateHelper(this.store),
      scheduler,
      environment
    );

    const eventsDataManager = new EventsDataManager(
      new FetcherImpl<"Events">(this.baseApiHelper),
      new EventsStateHelper(this.store),
      scheduler,
      environment
    );

    const instanceLogsHelper = new InstanceLogsDataManager(
      new FetcherImpl<"InstanceLogs">(this.baseApiHelper),
      new InstanceLogsStateHelper(this.store),
      environment
    );

    const instanceConfigStateHelper = new InstanceConfigStateHelper(this.store);

    const instanceConfigHelper = new InstanceConfigDataManager(
      new FetcherImpl<"InstanceConfig">(this.baseApiHelper),
      instanceConfigStateHelper,
      new ServiceStateHelper(this.store, serviceKeyMaker, environment),
      new FetcherImpl<"Service">(this.baseApiHelper),
      environment
    );

    const diagnosticsStateHelper = new DiagnosticsStateHelper(this.store);

    const diagnosticsHelper = new DiagnosticsDataManager(
      new FetcherImpl<"Diagnostics">(this.baseApiHelper),
      diagnosticsStateHelper,
      scheduler,
      environment
    );

    return [
      servicesHelper,
      serviceHelper,
      serviceInstancesHelper,
      resourcesHelper,
      eventsDataManager,
      instanceLogsHelper,
      instanceConfigHelper,
      diagnosticsHelper,
    ];
  }
}

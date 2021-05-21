import { createContext } from "react";
import { Store } from "@/UI/Store";
import { Dependencies } from "@/UI/Dependency/Dependency";
import { BaseApiHelper, FetcherImpl, InstanceConfigPoster } from "@/Infra";
import {
  DataProviderImpl,
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
  CommandProviderImpl,
  DiagnosticsStateHelper,
  DiagnosticsDataManager,
  InstanceConfigCommandManager,
} from "@/UI/Data";
import { DataProvider, SchedulerImpl } from "@/Core";
import { UrlManagerImpl } from "@/UI/Routing";
import { DummyDataProvider } from "./DummyDataProvider";

interface DependencyManager {
  getDependencies(environment: string): Dependencies;
}

class DummyDependencyManager implements DependencyManager {
  getDependencies(): Dependencies {
    throw new Error("method getDependencies not implemented");
  }
}

export const DependencyManagerContext = createContext<DependencyManager>(
  new DummyDependencyManager()
);

export class DependencyManagerImpl implements DependencyManager {
  constructor(
    private readonly store: Store,
    private readonly baseApiHelper: BaseApiHelper
  ) {}

  getDependencies(environment: string): Dependencies {
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

    const dataProvider = new DataProviderImpl([
      servicesHelper,
      serviceHelper,
      serviceInstancesHelper,
      resourcesHelper,
      eventsDataManager,
      instanceLogsHelper,
      instanceConfigHelper,
      diagnosticsHelper,
    ]);

    const instanceConfigCommandManager = new InstanceConfigCommandManager(
      new InstanceConfigPoster(this.baseApiHelper, environment),
      instanceConfigStateHelper
    );

    const commandProvider = new CommandProviderImpl([
      instanceConfigCommandManager,
    ]);

    return {
      commandProvider,
      dataProvider,
      urlManager: new UrlManagerImpl(
        this.baseApiHelper.getBaseUrl(),
        environment
      ),
    };
  }
}

export const ProjectsProviderContext = createContext<DataProvider>(
  new DummyDataProvider()
);

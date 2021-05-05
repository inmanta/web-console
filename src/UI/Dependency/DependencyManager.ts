import { createContext } from "react";
import { KeycloakInstance } from "keycloak-js";
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
  UrlControllerImpl,
} from "@/UI/Data";
import { SchedulerImpl } from "@/Core";

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
    private readonly keycloak: KeycloakInstance
  ) {}

  getDependencies(environment: string): Dependencies {
    const baseUrl = process.env.API_BASEURL ? process.env.API_BASEURL : "";
    const baseApiHelper = new BaseApiHelper(baseUrl, this.keycloak);
    const serviceKeyMaker = new ServiceKeyMaker();
    const scheduler = new SchedulerImpl(5000);

    const servicesHelper = new ServicesDataManager(
      new FetcherImpl<"Services">(baseApiHelper),
      new ServicesStateHelper(this.store, environment),
      scheduler,
      environment
    );

    const serviceHelper = new ServiceDataManager(
      new FetcherImpl<"Service">(baseApiHelper),
      new ServiceStateHelper(this.store, serviceKeyMaker, environment),
      scheduler,
      serviceKeyMaker,
      environment
    );

    const serviceInstancesHelper = new ServiceInstancesDataManager(
      new FetcherImpl<"ServiceInstances">(baseApiHelper),
      new ServiceInstancesStateHelper(this.store, environment),
      scheduler,
      environment
    );

    const resourcesHelper = new ResourcesDataManager(
      new FetcherImpl<"Resources">(baseApiHelper),
      new ResourcesStateHelper(this.store),
      scheduler,
      environment
    );

    const eventsDataManager = new EventsDataManager(
      new FetcherImpl<"Events">(baseApiHelper),
      new EventsStateHelper(this.store),
      scheduler,
      environment
    );

    const instanceLogsHelper = new InstanceLogsDataManager(
      new FetcherImpl<"InstanceLogs">(baseApiHelper),
      new InstanceLogsStateHelper(this.store),
      environment
    );

    const instanceConfigStateHelper = new InstanceConfigStateHelper(this.store);

    const instanceConfigHelper = new InstanceConfigDataManager(
      new FetcherImpl<"InstanceConfig">(baseApiHelper),
      instanceConfigStateHelper,
      new ServiceStateHelper(this.store, serviceKeyMaker, environment),
      new FetcherImpl<"Service">(baseApiHelper),
      environment
    );

    const diagnosticsStateHelper = new DiagnosticsStateHelper(this.store);

    const diagnosticsHelper = new DiagnosticsDataManager(
      new FetcherImpl<"Diagnostics">(baseApiHelper),
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

    const commandProvider = new CommandProviderImpl(
      new InstanceConfigPoster(baseApiHelper),
      instanceConfigStateHelper
    );

    return {
      commandProvider,
      dataProvider,
      urlController: new UrlControllerImpl(baseUrl, environment),
    };
  }
}

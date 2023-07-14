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
  ServiceInstanceQueryManager,
  ServiceInstanceStateHelper,
  GetServerStatusOneTimeQueryManager,
  GetServerStatusContinuousQueryManager,
  GetServerStatusStateHelper,
  GetEnvironmentSettingsQueryManager,
  GetEnvironmentSettingsStateHelper,
  GetEnvironmentsQueryManager,
  GetEnvironmentsStateHelper,
  GetCompilationStateQueryManager,
  GetCompilerStatusQueryManager,
  GetServiceInstancesOneTimeQueryManager,
  GetServiceOneTimeQueryManager,
  GetServiceInstanceOneTimeQueryManager,
  GetInstanceWithRelationsQueryManager,
  GetInstanceWithRelationsStateHelper,
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
  GetDesiredStatesQueryManager,
  GetDesiredStatesStateHelper,
} from "@S/DesiredState/Data";
import {
  GetDesiredStateDiffQueryManager,
  GetDesiredStateDiffStateHelper,
} from "@S/DesiredStateCompare/Data";
import {
  GetVersionResourcesQueryManager,
  GetVersionResourcesStateHelper,
} from "@S/DesiredStateDetails/Data";
import { GetDesiredStateResourceDetailsQueryManager } from "@S/DesiredStateResourceDetails/Data";
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
import {
  GetParametersQueryManager,
  GetParametersStateHelper,
} from "@S/Parameters/Data";
import { GetResourcesQueryManager } from "@S/Resource/Data";
import {
  GetResourceFactsQueryManager,
  GetResourceFactsStateHelper,
  ResourceDetailsQueryManager,
  ResourceDetailsStateHelper,
  ResourceHistoryQueryManager,
  ResourceHistoryStateHelper,
  ResourceLogsQueryManager,
  ResourceLogsStateHelper,
} from "@S/ResourceDetails/Data";
import {
  CallbacksQueryManager,
  CallbacksStateHelper,
} from "@S/ServiceDetails/Data";
import {
  GetInstanceLogsQueryManager,
  GetInstanceLogsStateHelper,
} from "@S/ServiceInstanceHistory/Data";
import { GetMetricsQueryManager } from "../Managers/GetMetrics";
import { GetMetricsStateHelper } from "../Managers/GetMetrics/StateHelper";

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
    const serviceStateHelper = ServiceStateHelper(this.store, serviceKeyMaker);
    const serviceInstancesStateHelper = ServiceInstancesStateHelper(this.store);
    const serviceInstanceStateHelper = ServiceInstanceStateHelper(this.store);

    return [
      GetProjectsQueryManager(this.store, this.apiHelper),
      GetEnvironmentsQueryManager(
        this.apiHelper,
        GetEnvironmentsStateHelper(this.store)
      ),
      GetServerStatusOneTimeQueryManager(
        this.apiHelper,
        GetServerStatusStateHelper(this.store)
      ),
      GetServerStatusContinuousQueryManager(
        this.apiHelper,
        GetServerStatusStateHelper(this.store),
        this.slowScheduler
      ),
      GetMetricsQueryManager(this.apiHelper, GetMetricsStateHelper(this.store)),
      GetEnvironmentSettingsQueryManager(
        this.apiHelper,
        GetEnvironmentSettingsStateHelper(this.store)
      ),
      ServicesQueryManager(
        this.apiHelper,
        ServicesStateHelper(this.store),
        this.scheduler
      ),
      ServiceQueryManager(
        this.apiHelper,
        serviceStateHelper,
        this.scheduler,
        serviceKeyMaker
      ),
      ServiceInstancesQueryManager(
        this.apiHelper,
        serviceInstancesStateHelper,
        this.scheduler
      ),
      GetServiceInstancesOneTimeQueryManager(
        this.apiHelper,
        serviceInstancesStateHelper
      ),
      GetServiceInstanceOneTimeQueryManager(
        this.apiHelper,
        serviceInstanceStateHelper
      ),
      GetInstanceWithRelationsQueryManager(
        this.apiHelper,
        GetInstanceWithRelationsStateHelper(this.store)
      ),
      GetServiceOneTimeQueryManager(this.apiHelper, serviceStateHelper),
      ServiceConfigQueryManager(
        this.apiHelper,
        ServiceConfigStateHelper(this.store),
        new ServiceConfigFinalizer(serviceStateHelper)
      ),
      InstanceResourcesQueryManager(
        this.apiHelper,
        InstanceResourcesStateHelper(this.store),
        serviceInstancesStateHelper,
        this.scheduler,
        this.instanceResourcesRetryLimit
      ),
      EventsQueryManager(
        this.apiHelper,
        EventsStateHelper(this.store),
        this.scheduler
      ),
      GetInstanceLogsQueryManager(
        this.apiHelper,
        GetInstanceLogsStateHelper(this.store),
        this.scheduler
      ),
      InstanceConfigQueryManager(
        this.apiHelper,
        InstanceConfigStateHelper(this.store),
        new InstanceConfigFinalizer(serviceStateHelper)
      ),
      DiagnosticsQueryManager(
        this.apiHelper,
        DiagnosticsStateHelper(this.store),
        this.scheduler
      ),
      GetResourcesQueryManager(this.store, this.apiHelper, this.scheduler),
      ResourceDetailsQueryManager(
        this.apiHelper,
        ResourceDetailsStateHelper(this.store),
        this.scheduler
      ),
      ResourceHistoryQueryManager(
        this.apiHelper,
        ResourceHistoryStateHelper(this.store),
        this.scheduler
      ),
      EnvironmentDetailsContinuousQueryManager(
        this.store,
        this.apiHelper,
        this.scheduler
      ),
      EnvironmentDetailsOneTimeQueryManager(this.store, this.apiHelper),
      ServiceInstanceQueryManager(
        this.apiHelper,
        serviceInstanceStateHelper,
        this.scheduler
      ),
      CallbacksQueryManager(this.apiHelper, CallbacksStateHelper(this.store)),
      CompileReportsQueryManager(this.store, this.apiHelper, this.scheduler),
      CompileDetailsQueryManager(
        this.store,
        this.apiHelper,

        this.scheduler
      ),
      ResourceLogsQueryManager(
        this.apiHelper,
        ResourceLogsStateHelper(this.store),
        this.scheduler
      ),
      GetResourceFactsQueryManager(
        this.apiHelper,
        GetResourceFactsStateHelper(this.store),
        this.scheduler
      ),
      GetAgentsQueryManager(this.store, this.apiHelper, this.scheduler),
      GetAgentProcessQueryManager(this.store, this.apiHelper),
      GetDesiredStatesQueryManager(
        this.apiHelper,
        GetDesiredStatesStateHelper(this.store),
        this.scheduler
      ),
      GetVersionResourcesQueryManager(
        this.apiHelper,
        GetVersionResourcesStateHelper(this.store),
        this.scheduler
      ),
      GetCompilerStatusQueryManager(this.apiHelper, this.scheduler),
      GetCompilationStateQueryManager(this.apiHelper, this.scheduler),
      GetParametersQueryManager(
        this.apiHelper,
        GetParametersStateHelper(this.store),
        this.scheduler
      ),
      GetFactsQueryManager(this.store, this.apiHelper, this.scheduler),
      GetDesiredStateDiffQueryManager(
        this.apiHelper,
        GetDesiredStateDiffStateHelper(this.store)
      ),
      GetDryRunsQueryManager(this.apiHelper, this.store, this.scheduler),
      GetDryRunReportQueryManager(this.apiHelper, this.store),
      GetDesiredStateResourceDetailsQueryManager(
        this.apiHelper,
        this.store,
        this.scheduler
      ),
      NotificationContinuousQueryManager(
        this.apiHelper,
        this.store,
        this.scheduler
      ),
      NotificationReadOnlyQueryManager(this.store),
    ];
  }
}

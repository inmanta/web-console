import { AuthHelper, CommandManager, ManagerResolver } from "@/Core";
import { BaseApiHelper } from "@/Data/API";
import { AttributeResultConverterImpl } from "@/Data/Common/AttributeConverter";
import {
  CreateInstanceCommandManager,
  DeleteInstanceCommandManager,
  InstanceConfigCommandManager,
  InstanceConfigStateHelper,
  TriggerInstanceUpdateCommandManager,
  ServiceConfigStateHelper,
  ServiceConfigCommandManager,
  TriggerSetStateCommandManager,
  DeleteServiceCommandManager,
  HaltEnvironmentCommandManager,
  ResumeEnvironmentCommandManager,
  DeleteCallbackCommandManager,
  CallbacksStateHelper,
  CallbacksUpdater,
  CreateCallbackCommandManager,
  EnvironmentDetailsUpdater,
  EnvironmentDetailsStateHelper,
  DeleteEnvironmentCommandManager,
  ProjectsUpdater,
  GetProjectsStateHelper,
  ModifyEnvironmentCommandManager,
  CreateProjectCommandManager,
  CreateEnvironmentCommandManager,
  UpdateEnvironmentSettingCommandManager,
  EnvironmentSettingUpdater,
  GetEnvironmentSettingStateHelper,
  ResetEnvironmentSettingCommandManager,
  EnvironmentsUpdater,
  GetEnvironmentsStateHelper,
  GenerateTokenCommandManager,
  RepairCommandManager,
  DeployCommandManager,
  GetSupportArchiveCommandManager,
  PromoteVersionCommandManager,
  GetDesiredStatesStateHelper,
  DesiredStatesUpdater,
} from "@/Data/Managers";
import { Store } from "@/Data/Store";

export class CommandManagerResolver implements ManagerResolver<CommandManager> {
  private managers: CommandManager[] = [];

  constructor(
    private readonly store: Store,
    private readonly apiHelper: BaseApiHelper,
    private readonly authHelper: AuthHelper
  ) {
    this.managers = this.getIndependentManagers();
  }

  get(): CommandManager[] {
    return this.managers;
  }

  resolve(env: string): void {
    this.managers = [
      ...this.getIndependentManagers(),
      ...this.getEnvDependentManagers(env),
    ];
  }

  private getIndependentManagers(): CommandManager[] {
    return [
      new DeleteEnvironmentCommandManager(
        this.apiHelper,
        new EnvironmentsUpdater(
          new GetEnvironmentsStateHelper(this.store),
          this.apiHelper
        )
      ),
      new CreateProjectCommandManager(
        this.apiHelper,
        new ProjectsUpdater(
          new GetProjectsStateHelper(this.store),
          this.apiHelper
        )
      ),
      new CreateEnvironmentCommandManager(this.apiHelper),
      new GetSupportArchiveCommandManager(this.apiHelper),
    ];
  }

  private getEnvDependentManagers(environment: string): CommandManager[] {
    const environmentDetailsStateHelper = new EnvironmentDetailsStateHelper(
      this.store,
      environment
    );
    const environmentSettingUpdater = new EnvironmentSettingUpdater(
      this.apiHelper,
      new GetEnvironmentSettingStateHelper(this.store, environment),
      environment
    );
    const getDesiredStatesStateHelper = new GetDesiredStatesStateHelper(
      this.store,
      environment
    );
    const desiredStatesUpdater = new DesiredStatesUpdater(
      getDesiredStatesStateHelper,
      this.apiHelper,
      environment
    );
    const callbacksUpdater = new CallbacksUpdater(
      new CallbacksStateHelper(this.store),
      this.apiHelper
    );

    return [
      new ServiceConfigCommandManager(
        this.apiHelper,
        new ServiceConfigStateHelper(this.store),
        environment
      ),
      new InstanceConfigCommandManager(
        this.apiHelper,
        new InstanceConfigStateHelper(this.store),
        environment
      ),
      new CreateInstanceCommandManager(this.apiHelper),
      new TriggerInstanceUpdateCommandManager(
        this.apiHelper,
        new AttributeResultConverterImpl(),
        environment
      ),
      new DeleteInstanceCommandManager(this.apiHelper),
      new DeleteServiceCommandManager(this.apiHelper, environment),
      new TriggerSetStateCommandManager(
        this.authHelper,
        this.apiHelper,
        environment
      ),
      new HaltEnvironmentCommandManager(
        this.apiHelper,
        environmentDetailsStateHelper,
        new EnvironmentDetailsUpdater(
          environmentDetailsStateHelper,
          this.apiHelper,
          environment
        ),
        environment
      ),
      new ResumeEnvironmentCommandManager(
        this.apiHelper,
        environmentDetailsStateHelper,
        new EnvironmentDetailsUpdater(
          environmentDetailsStateHelper,
          this.apiHelper,
          environment
        ),
        environment
      ),
      new DeleteCallbackCommandManager(this.apiHelper, callbacksUpdater),
      new CreateCallbackCommandManager(this.apiHelper, callbacksUpdater),
      new ModifyEnvironmentCommandManager(
        this.apiHelper,
        new EnvironmentDetailsUpdater(
          new EnvironmentDetailsStateHelper(this.store, environment),
          this.apiHelper,
          environment
        ),
        environment
      ),
      new UpdateEnvironmentSettingCommandManager(
        this.apiHelper,
        environmentSettingUpdater,
        environment
      ),
      new ResetEnvironmentSettingCommandManager(
        this.apiHelper,
        environmentSettingUpdater,
        environment
      ),
      new GenerateTokenCommandManager(this.apiHelper, environment),
      new DeployCommandManager(this.apiHelper, environment),
      new RepairCommandManager(this.apiHelper, environment),
      new PromoteVersionCommandManager(
        this.apiHelper,
        desiredStatesUpdater,
        environment
      ),
    ];
  }
}

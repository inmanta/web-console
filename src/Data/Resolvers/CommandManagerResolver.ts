import { AuthHelper, CommandManager, ManagerResolver } from "@/Core";
import { BaseApiHelper } from "@/Data/API";
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
    this.managers = this.getManagers();
  }

  get(): CommandManager[] {
    return this.managers;
  }

  private getManagers(): CommandManager[] {
    const environmentDetailsStateHelper = new EnvironmentDetailsStateHelper(
      this.store
    );
    const environmentSettingUpdater = new EnvironmentSettingUpdater(
      this.apiHelper,
      new GetEnvironmentSettingStateHelper(this.store)
    );
    const getDesiredStatesStateHelper = new GetDesiredStatesStateHelper(
      this.store
    );
    const desiredStatesUpdater = new DesiredStatesUpdater(
      getDesiredStatesStateHelper,
      this.apiHelper
    );
    const callbacksUpdater = new CallbacksUpdater(
      new CallbacksStateHelper(this.store),
      this.apiHelper
    );

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
      new ServiceConfigCommandManager(
        this.apiHelper,
        new ServiceConfigStateHelper(this.store)
      ),
      new InstanceConfigCommandManager(
        this.apiHelper,
        new InstanceConfigStateHelper(this.store)
      ),
      new CreateInstanceCommandManager(this.apiHelper),
      new TriggerInstanceUpdateCommandManager(this.apiHelper),
      new DeleteInstanceCommandManager(this.apiHelper),
      new DeleteServiceCommandManager(this.apiHelper),
      new TriggerSetStateCommandManager(this.authHelper, this.apiHelper),
      new HaltEnvironmentCommandManager(
        this.apiHelper,
        environmentDetailsStateHelper,
        new EnvironmentDetailsUpdater(
          environmentDetailsStateHelper,
          this.apiHelper
        )
      ),
      new ResumeEnvironmentCommandManager(
        this.apiHelper,
        environmentDetailsStateHelper,
        new EnvironmentDetailsUpdater(
          environmentDetailsStateHelper,
          this.apiHelper
        )
      ),
      new DeleteCallbackCommandManager(this.apiHelper, callbacksUpdater),
      new CreateCallbackCommandManager(this.apiHelper, callbacksUpdater),
      new ModifyEnvironmentCommandManager(
        this.apiHelper,
        new EnvironmentDetailsUpdater(
          new EnvironmentDetailsStateHelper(this.store),
          this.apiHelper
        )
      ),
      new UpdateEnvironmentSettingCommandManager(
        this.apiHelper,
        environmentSettingUpdater
      ),
      new ResetEnvironmentSettingCommandManager(
        this.apiHelper,
        environmentSettingUpdater
      ),
      new GenerateTokenCommandManager(this.apiHelper),
      new DeployCommandManager(this.apiHelper),
      new RepairCommandManager(this.apiHelper),
      new PromoteVersionCommandManager(this.apiHelper, desiredStatesUpdater),
    ];
  }
}

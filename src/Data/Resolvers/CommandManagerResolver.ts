import { ApiHelper, AuthHelper, CommandManager, ManagerResolver } from "@/Core";
import {
  DeleteInstanceCommandManager,
  InstanceConfigCommandManager,
  InstanceConfigStateHelper,
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
  ModifyEnvironmentCommandManager,
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
  DesiredStatesUpdater,
  ControlAgentCommandManager,
  TriggerCompileCommandManager,
  TriggerDryRun,
} from "@/Data/Managers";
import { Store } from "@/Data/Store";
import {
  EnvironmentDetailsUpdater,
  GetEnvironmentDetailsStateHelper,
} from "@/Slices/Settings/Data/GetEnvironmentDetails";
import { GetProjectsStateHelper } from "@/Slices/Settings/Data/GetProjects";
import { GetAgentsUpdater } from "@S/Agents/Data/Updater";
import {
  CreateEnvironmentCommandManager,
  CreateProjectCommandManager,
} from "@S/CreateEnvironment/Data";
import { CreateInstanceCommandManager } from "@S/CreateInstance/Data";
import { GetDesiredStatesStateHelper } from "@S/DesiredState/Data";
import { TriggerInstanceUpdateCommandManager } from "@S/EditInstance/Data";
import { DeleteEnvironmentCommandManager, ProjectsUpdater } from "@S/Home/Data";
import { UpdateNotificationCommandManager } from "@S/Notification/Data/CommandManager";

export class CommandManagerResolver implements ManagerResolver<CommandManager> {
  private managers: CommandManager[] = [];

  constructor(
    private readonly store: Store,
    private readonly apiHelper: ApiHelper,
    private readonly authHelper: AuthHelper
  ) {
    this.managers = this.getManagers();
  }

  get(): CommandManager[] {
    return this.managers;
  }

  private getManagers(): CommandManager[] {
    const environmentDetailsStateHelper = new GetEnvironmentDetailsStateHelper(
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
    const environmentDetailsUpdater = new EnvironmentDetailsUpdater(
      this.store,
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
      new CreateEnvironmentCommandManager(
        this.apiHelper,
        new EnvironmentsUpdater(
          new GetEnvironmentsStateHelper(this.store),
          this.apiHelper
        )
      ),
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
        environmentDetailsUpdater
      ),
      new ResumeEnvironmentCommandManager(
        this.apiHelper,
        environmentDetailsStateHelper,
        environmentDetailsUpdater
      ),
      new DeleteCallbackCommandManager(this.apiHelper, callbacksUpdater),
      new CreateCallbackCommandManager(this.apiHelper, callbacksUpdater),
      new ModifyEnvironmentCommandManager(
        this.apiHelper,
        new EnvironmentDetailsUpdater(this.store, this.apiHelper),
        new EnvironmentsUpdater(
          new GetEnvironmentsStateHelper(this.store),
          this.apiHelper
        )
      ),
      new UpdateEnvironmentSettingCommandManager(
        this.apiHelper,
        environmentSettingUpdater,
        environmentDetailsUpdater
      ),
      new ResetEnvironmentSettingCommandManager(
        this.apiHelper,
        environmentSettingUpdater,
        environmentDetailsUpdater
      ),
      new GenerateTokenCommandManager(this.apiHelper),
      new DeployCommandManager(this.apiHelper),
      new RepairCommandManager(this.apiHelper),
      new PromoteVersionCommandManager(this.apiHelper, desiredStatesUpdater),
      new ControlAgentCommandManager(
        this.apiHelper,
        new GetAgentsUpdater(this.store, this.apiHelper)
      ),
      new TriggerCompileCommandManager(this.apiHelper),
      new TriggerDryRun.CommandManager(this.apiHelper),
      new UpdateNotificationCommandManager(this.apiHelper, this.store),
    ];
  }
}

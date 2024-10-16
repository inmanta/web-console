import { ApiHelper, CommandManager, CommandManagerResolver } from "@/Core";
import {
  DeleteInstanceCommandManager,
  DestroyInstanceCommandManager,
  InstanceConfigCommandManager,
  InstanceConfigStateHelper,
  ServiceConfigStateHelper,
  ServiceConfigCommandManager,
  TriggerSetStateCommandManager,
  DeleteServiceCommandManager,
  HaltEnvironmentCommandManager,
  ResumeEnvironmentCommandManager,
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
  ControlAgentCommandManager,
  TriggerCompileCommandManager,
  TriggerDryRun,
  TriggerForceStateCommandManager,
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
import { TriggerInstanceUpdateCommandManager } from "@S/EditInstance/Data";
import { DeleteEnvironmentCommandManager, ProjectsUpdater } from "@S/Home/Data";
import { UpdateNotificationCommandManager } from "@S/Notification/Data/CommandManager";
import {
  CallbacksStateHelper,
  CallbacksUpdater,
  CreateCallbackCommandManager,
  DeleteCallbackCommandManager,
} from "@S/ServiceDetails/Data";
import { ClearEnvironmentCommandManager } from "@S/Settings/Data/ClearEnvironmentCommandManager";
import { AuthContextInterface } from "../Auth";
import { UpdateCatalogCommandManager } from "../Managers/UpdateCatalog/CommandManager";
import { UpdateInstanceAttributeCommandManager } from "../Managers/UpdateInstanceAttribute";

export class CommandManagerResolverImpl implements CommandManagerResolver {
  private managers: CommandManager[] = [];

  constructor(
    private readonly store: Store,
    private readonly apiHelper: ApiHelper,
    private readonly authHelper: AuthContextInterface,
  ) {
    this.managers = this.getManagers();
  }

  get(): CommandManager[] {
    return this.managers;
  }

  private getManagers(): CommandManager[] {
    const environmentDetailsStateHelper = GetEnvironmentDetailsStateHelper(
      this.store,
    );
    const environmentSettingUpdater = new EnvironmentSettingUpdater(
      this.apiHelper,
      GetEnvironmentSettingStateHelper(this.store),
    );
    const callbacksUpdater = new CallbacksUpdater(
      CallbacksStateHelper(this.store),
      this.apiHelper,
    );
    const environmentDetailsUpdater = new EnvironmentDetailsUpdater(
      this.store,
      this.apiHelper,
    );

    return [
      new DeleteEnvironmentCommandManager(
        this.apiHelper,
        new EnvironmentsUpdater(
          GetEnvironmentsStateHelper(this.store),
          this.apiHelper,
        ),
      ),
      new ClearEnvironmentCommandManager(this.apiHelper),
      new CreateProjectCommandManager(
        this.apiHelper,
        new ProjectsUpdater(GetProjectsStateHelper(this.store), this.apiHelper),
      ),
      new CreateEnvironmentCommandManager(
        this.apiHelper,
        new EnvironmentsUpdater(
          GetEnvironmentsStateHelper(this.store),
          this.apiHelper,
        ),
      ),
      new GetSupportArchiveCommandManager(this.apiHelper),
      ServiceConfigCommandManager(
        this.apiHelper,
        ServiceConfigStateHelper(this.store),
      ),
      InstanceConfigCommandManager(
        this.apiHelper,
        InstanceConfigStateHelper(this.store),
      ),
      CreateInstanceCommandManager(this.apiHelper),
      TriggerInstanceUpdateCommandManager(this.apiHelper),
      DestroyInstanceCommandManager(this.apiHelper),
      DeleteInstanceCommandManager(this.apiHelper),
      DeleteServiceCommandManager(this.apiHelper),
      TriggerSetStateCommandManager(this.authHelper, this.apiHelper),
      UpdateInstanceAttributeCommandManager(this.authHelper, this.apiHelper),
      TriggerForceStateCommandManager(this.authHelper, this.apiHelper),
      HaltEnvironmentCommandManager(
        this.apiHelper,
        environmentDetailsStateHelper,
        environmentDetailsUpdater,
      ),
      ResumeEnvironmentCommandManager(
        this.apiHelper,
        environmentDetailsStateHelper,
        environmentDetailsUpdater,
      ),
      DeleteCallbackCommandManager(this.apiHelper, callbacksUpdater),
      CreateCallbackCommandManager(this.apiHelper, callbacksUpdater),
      ModifyEnvironmentCommandManager(
        this.apiHelper,
        new EnvironmentDetailsUpdater(this.store, this.apiHelper),
        new EnvironmentsUpdater(
          GetEnvironmentsStateHelper(this.store),
          this.apiHelper,
        ),
      ),
      UpdateEnvironmentSettingCommandManager(
        this.apiHelper,
        environmentSettingUpdater,
        environmentDetailsUpdater,
      ),
      ResetEnvironmentSettingCommandManager(
        this.apiHelper,
        environmentSettingUpdater,
        environmentDetailsUpdater,
      ),
      GenerateTokenCommandManager(this.apiHelper),
      DeployCommandManager(this.apiHelper),
      RepairCommandManager(this.apiHelper),
      ControlAgentCommandManager(
        this.apiHelper,
        new GetAgentsUpdater(this.store, this.apiHelper),
      ),
      TriggerCompileCommandManager(this.apiHelper),
      TriggerDryRun.CommandManager(this.apiHelper),
      UpdateNotificationCommandManager(this.apiHelper, this.store),
      UpdateCatalogCommandManager(this.apiHelper),
    ];
  }
}

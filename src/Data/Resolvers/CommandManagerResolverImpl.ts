import { ApiHelper, CommandManager, CommandManagerResolver } from "@/Core";
import {
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
  ControlAgentCommandManager,
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
import { DeleteEnvironmentCommandManager, ProjectsUpdater } from "@S/Home/Data";
import {
  CallbacksStateHelper,
  CallbacksUpdater,
  CreateCallbackCommandManager,
  DeleteCallbackCommandManager,
} from "@S/ServiceDetails/Data";
import { ClearEnvironmentCommandManager } from "@S/Settings/Data/ClearEnvironmentCommandManager";

export class CommandManagerResolverImpl implements CommandManagerResolver {
  private managers: CommandManager[] = [];

  constructor (
    private readonly store: Store,
    private readonly apiHelper: ApiHelper,
  ) {
    this.managers = this.getManagers();
  }

  get (): CommandManager[] {
    return this.managers;
  }

  private getManagers (): CommandManager[] {
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
      TriggerDryRun.CommandManager(this.apiHelper),
    ];
  }
}

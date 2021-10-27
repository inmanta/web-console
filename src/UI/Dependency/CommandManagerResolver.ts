import { AuthHelper, CommandManager, ManagerResolver } from "@/Core";
import {
  BaseApiHelper,
  AttributeResultConverterImpl,
  CreateInstanceCommandManager,
  DeleteInstanceCommandManager,
  InstanceConfigCommandManager,
  InstanceConfigStateHelper,
  TriggerInstanceUpdateCommandManager,
  ServiceConfigStateHelper,
  ServiceConfigCommandManager,
  TriggerSetStateCommandManager,
  Store,
  DeleteServiceCommandManager,
  HaltEnvironmentCommandManager,
  ResumeEnvironmentCommandManager,
  DeleteCallbackCommandManager,
  FetcherImpl,
  CallbacksStateHelper,
  CallbacksUpdater,
  CreateCallbackCommandManager,
  EnvironmentDetailsUpdater,
  EnvironmentDetailsStateHelper,
  DeleteEnvironmentCommandManager,
  ProjectsUpdater,
  ProjectsStateHelper,
  ModifyEnvironmentCommandManager,
  CreateProjectCommandManager,
  CreateEnvironmentCommandManager,
  UpdateEnvironmentSettingCommandManager,
  EnvironmentSettingUpdater,
  GetEnvironmentSettingStateHelper,
  ResetEnvironmentSettingCommandManager,
} from "@/Data";

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
        new ProjectsUpdater(
          new ProjectsStateHelper(this.store),
          new FetcherImpl<"GetProjects">(this.apiHelper)
        )
      ),
      new CreateProjectCommandManager(
        this.apiHelper,
        new ProjectsUpdater(
          new ProjectsStateHelper(this.store),
          new FetcherImpl<"GetProjects">(this.apiHelper)
        )
      ),
      new CreateEnvironmentCommandManager(this.apiHelper),
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
      new CreateInstanceCommandManager(
        this.apiHelper,
        new AttributeResultConverterImpl(),
        environment
      ),
      new TriggerInstanceUpdateCommandManager(
        this.apiHelper,
        new AttributeResultConverterImpl(),
        environment
      ),
      new DeleteInstanceCommandManager(this.apiHelper, environment),
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
          new FetcherImpl<"GetEnvironmentDetails">(this.apiHelper),
          environment
        ),
        environment
      ),
      new ResumeEnvironmentCommandManager(
        this.apiHelper,
        environmentDetailsStateHelper,
        new EnvironmentDetailsUpdater(
          environmentDetailsStateHelper,
          new FetcherImpl<"GetEnvironmentDetails">(this.apiHelper),
          environment
        ),
        environment
      ),
      new DeleteCallbackCommandManager(
        this.apiHelper,
        new CallbacksUpdater(
          new CallbacksStateHelper(this.store, environment),
          this.apiHelper,
          environment
        ),
        environment
      ),
      new CreateCallbackCommandManager(
        this.apiHelper,
        new CallbacksUpdater(
          new CallbacksStateHelper(this.store, environment),
          this.apiHelper,
          environment
        ),
        environment
      ),
      new ModifyEnvironmentCommandManager(
        this.apiHelper,
        new ProjectsUpdater(
          new ProjectsStateHelper(this.store),
          new FetcherImpl<"GetProjects">(this.apiHelper)
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
    ];
  }
}

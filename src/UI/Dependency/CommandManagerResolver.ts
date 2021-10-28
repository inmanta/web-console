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
    private readonly baseApiHelper: BaseApiHelper,
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
        this.baseApiHelper,
        new ProjectsUpdater(
          new ProjectsStateHelper(this.store),
          new FetcherImpl<"GetProjects">(this.baseApiHelper)
        )
      ),
      new CreateProjectCommandManager(
        this.baseApiHelper,
        new ProjectsUpdater(
          new ProjectsStateHelper(this.store),
          new FetcherImpl<"GetProjects">(this.baseApiHelper)
        )
      ),
      new CreateEnvironmentCommandManager(this.baseApiHelper),
    ];
  }

  private getEnvDependentManagers(environment: string): CommandManager[] {
    const environmentDetailsStateHelper = new EnvironmentDetailsStateHelper(
      this.store,
      environment
    );
    const environmentSettingUpdater = new EnvironmentSettingUpdater(
      this.baseApiHelper,
      new GetEnvironmentSettingStateHelper(this.store, environment),
      environment
    );
    return [
      new ServiceConfigCommandManager(
        this.baseApiHelper,
        new ServiceConfigStateHelper(this.store),
        environment
      ),
      new InstanceConfigCommandManager(
        this.baseApiHelper,
        new InstanceConfigStateHelper(this.store),
        environment
      ),
      new CreateInstanceCommandManager(
        this.baseApiHelper,
        new AttributeResultConverterImpl(),
        environment
      ),
      new TriggerInstanceUpdateCommandManager(
        this.baseApiHelper,
        new AttributeResultConverterImpl(),
        environment
      ),
      new DeleteInstanceCommandManager(this.baseApiHelper, environment),
      new DeleteServiceCommandManager(this.baseApiHelper, environment),
      new TriggerSetStateCommandManager(
        this.authHelper,
        this.baseApiHelper,
        environment
      ),
      new HaltEnvironmentCommandManager(
        this.baseApiHelper,
        environmentDetailsStateHelper,
        new EnvironmentDetailsUpdater(
          environmentDetailsStateHelper,
          new FetcherImpl<"GetEnvironmentDetails">(this.baseApiHelper),
          environment
        ),
        environment
      ),
      new ResumeEnvironmentCommandManager(
        this.baseApiHelper,
        environmentDetailsStateHelper,
        new EnvironmentDetailsUpdater(
          environmentDetailsStateHelper,
          new FetcherImpl<"GetEnvironmentDetails">(this.baseApiHelper),
          environment
        ),
        environment
      ),
      new DeleteCallbackCommandManager(
        this.baseApiHelper,
        new CallbacksUpdater(
          new CallbacksStateHelper(this.store, environment),
          new FetcherImpl<"GetCallbacks">(this.baseApiHelper),
          environment
        ),
        environment
      ),
      new CreateCallbackCommandManager(
        this.baseApiHelper,
        new CallbacksUpdater(
          new CallbacksStateHelper(this.store, environment),
          new FetcherImpl<"GetCallbacks">(this.baseApiHelper),
          environment
        ),
        environment
      ),
      new ModifyEnvironmentCommandManager(
        this.baseApiHelper,
        new ProjectsUpdater(
          new ProjectsStateHelper(this.store),
          new FetcherImpl<"GetProjects">(this.baseApiHelper)
        ),
        environment
      ),
      new UpdateEnvironmentSettingCommandManager(
        this.baseApiHelper,
        environmentSettingUpdater,
        environment
      ),
      new ResetEnvironmentSettingCommandManager(
        this.baseApiHelper,
        environmentSettingUpdater,
        environment
      ),
    ];
  }
}

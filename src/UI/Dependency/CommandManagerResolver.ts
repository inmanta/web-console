import { AuthHelper, CommandManager, ManagerResolver } from "@/Core";
import {
  BaseApiHelper,
  InstanceDeleter,
  AttributeResultConverterImpl,
  CreateInstanceCommandManager,
  DeleteInstanceCommandManager,
  InstanceConfigCommandManager,
  InstanceConfigStateHelper,
  TriggerInstanceUpdateCommandManager,
  CreateInstancePoster,
  InstanceConfigPoster,
  ServiceConfigPoster,
  ServiceConfigStateHelper,
  ServiceConfigCommandManager,
  SetStatePoster,
  TriggerSetStateCommandManager,
  Store,
  DeleteServiceCommandManager,
  ServiceDeleter,
  HaltEnvironmentCommandManager,
  HaltEnvironmentPoster,
  ResumeEnvironmentCommandManager,
  ResumeEnvironmentPoster,
  DeleteCallbackCommandManager,
  FetcherImpl,
  CallbacksStateHelper,
  CallbacksUpdater,
  CreateCallbackCommandManager,
  EnvironmentDetailsUpdater,
  EnvironmentDetailsStateHelper,
  DeleteEnvironmentCommandManager,
  EnvironmentDeleter,
  ProjectsUpdater,
  ProjectsStateHelper,
  ModifyEnvironmentCommandManager,
  ModifyEnvironmentPoster,
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
        new EnvironmentDeleter(this.baseApiHelper),
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
        new ServiceConfigPoster(this.baseApiHelper, environment),
        new ServiceConfigStateHelper(this.store)
      ),
      new InstanceConfigCommandManager(
        new InstanceConfigPoster(this.baseApiHelper, environment),
        new InstanceConfigStateHelper(this.store)
      ),
      new CreateInstanceCommandManager(
        new CreateInstancePoster(this.baseApiHelper, environment),
        new AttributeResultConverterImpl()
      ),
      new TriggerInstanceUpdateCommandManager(
        this.baseApiHelper,
        new AttributeResultConverterImpl(),
        environment
      ),
      new DeleteInstanceCommandManager(
        new InstanceDeleter(this.baseApiHelper, environment)
      ),
      new DeleteServiceCommandManager(
        new ServiceDeleter(this.baseApiHelper, environment)
      ),
      new TriggerSetStateCommandManager(
        this.authHelper,
        new SetStatePoster(this.baseApiHelper, environment)
      ),
      new HaltEnvironmentCommandManager(
        new HaltEnvironmentPoster(this.baseApiHelper, environment),
        environmentDetailsStateHelper,
        new EnvironmentDetailsUpdater(
          environmentDetailsStateHelper,
          new FetcherImpl<"GetEnvironmentDetails">(this.baseApiHelper),
          environment
        )
      ),
      new ResumeEnvironmentCommandManager(
        new ResumeEnvironmentPoster(this.baseApiHelper, environment),
        environmentDetailsStateHelper,
        new EnvironmentDetailsUpdater(
          environmentDetailsStateHelper,
          new FetcherImpl<"GetEnvironmentDetails">(this.baseApiHelper),
          environment
        )
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
        new ModifyEnvironmentPoster(this.baseApiHelper, environment),
        new ProjectsUpdater(
          new ProjectsStateHelper(this.store),
          new FetcherImpl<"GetProjects">(this.baseApiHelper)
        )
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

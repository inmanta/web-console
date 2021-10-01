import { AuthHelper, CommandManager, ManagerResolver } from "@/Core";
import {
  BaseApiHelper,
  InstanceDeleter,
  TriggerInstanceUpdatePatcher,
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
  CallbackDeleter,
  FetcherImpl,
  CallbacksStateHelper,
  CallbacksUpdater,
  CreateCallbackCommandManager,
  CallbackPoster,
  EnvironmentDetailsUpdater,
  EnvironmentDetailsStateHelper,
} from "@/Data";

export class CommandManagerResolver implements ManagerResolver<CommandManager> {
  private managers: CommandManager[] = [];

  constructor(
    private readonly store: Store,
    private readonly baseApiHelper: BaseApiHelper,
    private readonly authHelper: AuthHelper
  ) {
    this.managers = [];
  }

  get(): CommandManager[] {
    return this.managers;
  }

  resolve(env: string): void {
    this.managers = this.getEnvDependentManagers(env);
  }

  private getEnvDependentManagers(environment: string): CommandManager[] {
    const environmentDetailsStateHelper = new EnvironmentDetailsStateHelper(
      this.store,
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
        new TriggerInstanceUpdatePatcher(this.baseApiHelper, environment),
        new AttributeResultConverterImpl()
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
          new FetcherImpl<"EnvironmentDetails">(this.baseApiHelper),
          environment
        )
      ),
      new ResumeEnvironmentCommandManager(
        new ResumeEnvironmentPoster(this.baseApiHelper, environment),
        environmentDetailsStateHelper,
        new EnvironmentDetailsUpdater(
          environmentDetailsStateHelper,
          new FetcherImpl<"EnvironmentDetails">(this.baseApiHelper),
          environment
        )
      ),
      new DeleteCallbackCommandManager(
        new CallbackDeleter(this.baseApiHelper, environment),
        new CallbacksUpdater(
          new CallbacksStateHelper(this.store, environment),
          new FetcherImpl<"Callbacks">(this.baseApiHelper),
          environment
        )
      ),
      new CreateCallbackCommandManager(
        new CallbackPoster(this.baseApiHelper, environment),
        new CallbacksUpdater(
          new CallbacksStateHelper(this.store, environment),
          new FetcherImpl<"Callbacks">(this.baseApiHelper),
          environment
        )
      ),
    ];
  }
}

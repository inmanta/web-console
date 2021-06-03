import { CommandManager, ManagerResolver } from "@/Core";
import {
  BaseApiHelper,
  CreateInstancePoster,
  InstanceConfigPoster,
  InstanceDeleter,
  TriggerInstanceUpdatePatcher,
} from "@/Infra";
import {
  AttributeResultConverterImpl,
  CreateInstanceCommandManager,
  DeleteInstanceCommandManager,
  InstanceConfigCommandManager,
  TriggerInstanceUpdateCommandManager,
} from "@/UI/Data";
import { Store } from "@/UI/Store";
import { InstanceConfigStateHelper } from "@/UI/Data";

export class CommandManagerResolver implements ManagerResolver<CommandManager> {
  private managers: CommandManager[] = [];

  constructor(
    private readonly store: Store,
    private readonly baseApiHelper: BaseApiHelper
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
    const instanceConfigCommandManager = new InstanceConfigCommandManager(
      new InstanceConfigPoster(this.baseApiHelper, environment),
      new InstanceConfigStateHelper(this.store)
    );

    const createInstanceCommandManager = new CreateInstanceCommandManager(
      new CreateInstancePoster(this.baseApiHelper, environment),
      new AttributeResultConverterImpl()
    );

    const triggerInstanceUpdateCommandManager =
      new TriggerInstanceUpdateCommandManager(
        new TriggerInstanceUpdatePatcher(this.baseApiHelper, environment),
        new AttributeResultConverterImpl()
      );

    const deleteInstanceCommandManager = new DeleteInstanceCommandManager(
      new InstanceDeleter(this.baseApiHelper, environment)
    );

    return [
      instanceConfigCommandManager,
      createInstanceCommandManager,
      triggerInstanceUpdateCommandManager,
      deleteInstanceCommandManager,
    ];
  }
}

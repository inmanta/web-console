import { CommandManager, ManagerResolver } from "@/Core";
import {
  BaseApiHelper,
  CreateInstancePoster,
  InstanceConfigPoster,
} from "@/Infra";
import {
  AttributeResultConverterImpl,
  CreateInstanceCommandManager,
  InstanceConfigCommandManager,
  UpdateInstanceCommandManager,
} from "@/UI/Data";
import { Store } from "@/UI/Store";
import { InstanceConfigStateHelper } from "@/UI/Data";
import { UpdateInstancePatcher } from "@/Infra/Api/UpdateInstancePatcher";

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

    const updateInstanceCommandManager = new UpdateInstanceCommandManager(
      new UpdateInstancePatcher(this.baseApiHelper, environment),
      new AttributeResultConverterImpl()
    );

    return [
      instanceConfigCommandManager,
      createInstanceCommandManager,
      updateInstanceCommandManager,
    ];
  }
}

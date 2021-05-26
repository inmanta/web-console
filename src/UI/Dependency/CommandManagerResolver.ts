import { CommandManager, ManagerResolver } from "@/Core";
import { BaseApiHelper, InstanceConfigPoster } from "@/Infra";
import { InstanceConfigCommandManager } from "@/UI/Data";
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
    this.managers = [...this.managers, ...this.getEnvDependentManagers(env)];
  }

  private getEnvDependentManagers(environment: string): CommandManager[] {
    const instanceConfigCommandManager = new InstanceConfigCommandManager(
      new InstanceConfigPoster(this.baseApiHelper, environment),
      new InstanceConfigStateHelper(this.store)
    );

    return [instanceConfigCommandManager];
  }
}

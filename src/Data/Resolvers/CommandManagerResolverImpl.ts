import { ApiHelper, CommandManager, CommandManagerResolver } from "@/Core";
import {
  GenerateTokenCommandManager,
  RepairCommandManager,
  DeployCommandManager,
  ControlAgentCommandManager,
  TriggerDryRun,
} from "@/Data/Managers";
import { Store } from "@/Data/Store";
import { GetAgentsUpdater } from "@S/Agents/Data/Updater";
import {
  CallbacksStateHelper,
  CallbacksUpdater,
  CreateCallbackCommandManager,
  DeleteCallbackCommandManager,
} from "@S/ServiceDetails/Data";

export class CommandManagerResolverImpl implements CommandManagerResolver {
  private managers: CommandManager[] = [];

  constructor(
    private readonly store: Store,
    private readonly apiHelper: ApiHelper
  ) {
    this.managers = this.getManagers();
  }

  get(): CommandManager[] {
    return this.managers;
  }

  private getManagers(): CommandManager[] {
    const callbacksUpdater = new CallbacksUpdater(CallbacksStateHelper(this.store), this.apiHelper);

    return [
      DeleteCallbackCommandManager(this.apiHelper, callbacksUpdater),
      CreateCallbackCommandManager(this.apiHelper, callbacksUpdater),
      GenerateTokenCommandManager(this.apiHelper),
      DeployCommandManager(this.apiHelper),
      RepairCommandManager(this.apiHelper),
      ControlAgentCommandManager(this.apiHelper, new GetAgentsUpdater(this.store, this.apiHelper)),
      TriggerDryRun.CommandManager(this.apiHelper),
    ];
  }
}

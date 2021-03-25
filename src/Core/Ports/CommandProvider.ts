import { Command } from "@/Core/Domain";

/**
 * The DataProvider is responsible for providing data to
 * components. This is based on hooks so that the logic is
 * attached to the component lifecycle. Data is provided
 * based on a query.
 */
export interface CommandProvider {
  getTrigger<Kind extends Command.Kind>(
    command: Command.Type
  ): Command.Trigger<Kind>;
}

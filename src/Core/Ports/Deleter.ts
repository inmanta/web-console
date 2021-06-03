import { Either } from "@/Core/Language";
import { Command } from "@/Core/Domain";

/**
 * The Deleter is responsible for sending delete requests to the API and receiving a response.
 *
 * @param {object} command The command describing the entity to delete
 */
export interface Deleter<Kind extends Command.Kind> {
  delete(
    command: Command.SubCommand<Kind>
  ): Promise<Either.Type<Command.Error<Kind>, Command.ApiData<Kind>>>;
}

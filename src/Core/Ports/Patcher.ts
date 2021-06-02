import { Either } from "@/Core/Language";
import { Command } from "@/Core/Domain";

/**
 * The Patcher is responsible for sending patch requests to the API and receiving a response.
 *
 * @param {string} environment The environment for the entity in question
 * @param {string} url The endpoint
 * @param {object} body The POST body that needs to be sent. This will be stringified.
 */
export interface Patcher<Kind extends Command.Kind> {
  patch(
    command: Command.SubCommand<Kind>,
    body: Command.Body<Kind>
  ): Promise<Either.Type<Command.Error<Kind>, Command.ApiData<Kind>>>;
}

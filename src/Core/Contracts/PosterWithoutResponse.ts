import { Maybe } from "@/Core/Language";
import { Command } from "@/Core/Command";

/**
 * The PosterWithoutResponse is responsible for posting data to the API, when the response is empty or not used.
 *
 * @param {string} environment The environment for the entity in question
 * @param {string} url The endpoint
 * @param {object} body The POST body that needs to be sent. This will be stringified.
 */
export interface PosterWithoutResponse<Kind extends Command.Kind> {
  post(
    command: Command.SubCommand<Kind>,
    body: Command.Body<Kind>
  ): Promise<Maybe.Type<Command.Error<Kind>>>;
}

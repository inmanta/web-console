import { Either } from "@/Core/Language";
import { Command } from "@/Core/Domain";

/**
 * The Poster is responsible for posting data to the API and receiving a response.
 *
 * @param {string} environment The environment for the entity in question
 * @param {string} url The endpoint
 * @param {object} body The POST body that needs to be sent. This will be stringified.
 */
export interface Poster<Kind extends Command.Kind> {
  post(
    qualifier: Command.Qualifier<"InstanceConfig">,
    body: Command.Body<Kind>
  ): Promise<Either.Type<Command.Error<Kind>, Command.ApiData<Kind>>>;
}

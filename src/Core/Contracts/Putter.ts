import { Maybe } from "@/Core/Language";
import { Command } from "@/Core/Command";

/**
 * The Putter is responsible for executing PUT calls on the API.
 * @param {object} command The command object describing the operation
 * @param {object} body The PUT body that needs to be sent. This will be stringified.
 */
export interface Putter<Kind extends Command.Kind> {
  put(
    command: Command.SubCommand<Kind>,
    body: Command.Body<Kind>
  ): Promise<Maybe.Type<Command.Error<Kind>>>;
}

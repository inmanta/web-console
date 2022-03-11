import { Maybe } from "@/Core/Language";
import { Id } from "./Resource";

export class IdParser {
  private static readonly parseIdRegex =
    /^(?<id>(?<type>(?<ns>[\w-]+(::[\w-]+)*)::(?<class>[\w-]+))\[(?<hostname>[^,]+),(?<attr>[^=]+)=(?<value>[^\]]+)\])(,v=(?<version>[0-9]+))?$/;

  public static parse(idStr: string): Maybe.Maybe<Id> {
    const groups = idStr.match(IdParser.parseIdRegex)?.groups;
    if (!groups) {
      return Maybe.none();
    }
    return Maybe.some({
      entityType: groups.type,
      agentName: groups.hostname,
      attribute: groups.attr,
      attributeValue: groups.value,
    });
  }

  public static getAgentName(idStr: string): Maybe.Maybe<Id["agentName"]> {
    const id = IdParser.parse(idStr);
    return Maybe.isSome(id) ? Maybe.some(id.value.agentName) : Maybe.none();
  }
}

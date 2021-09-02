import { Maybe } from "@/Core";

export interface ResourceId {
  entityType: string;
  agentName: string;
  attribute: string;
  attributeValue: string;
}

export class ResourceIdParser {
  private static readonly parseIdRegex =
    /^(?<id>(?<type>(?<ns>[\w-]+(::[\w-]+)*)::(?<class>[\w-]+))\[(?<hostname>[^,]+),(?<attr>[^=]+)=(?<value>[^\]]+)\])(,v=(?<version>[0-9]+))?$/;

  public static parse(idStr: string): Maybe.Type<ResourceId> {
    const groups = idStr.match(ResourceIdParser.parseIdRegex)?.groups;
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
}

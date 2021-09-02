export class ResourceId {
  private static readonly parseIdRegex =
    /^(?<id>(?<type>(?<ns>[\w-]+(::[\w-]+)*)::(?<class>[\w-]+))\[(?<hostname>[^,]+),(?<attr>[^=]+)=(?<value>[^\]]+)\])(,v=(?<version>[0-9]+))?$/;

  public static parse(idStr: string): ResourceId | null {
    const groups = idStr.match(ResourceId.parseIdRegex)?.groups;
    if (!groups) {
      return null;
    }
    return new ResourceId(
      groups.type,
      groups.hostname,
      groups.attr,
      groups.value
    );
  }

  constructor(
    private readonly entityType: string,
    private readonly agentName: string,
    private readonly attribute: string,
    private readonly attributeValue: string
  ) {}
  public getEntityType(): string {
    return this.entityType;
  }
  public getAgentName(): string {
    return this.agentName;
  }
  public getAttribute(): string {
    return this.attribute;
  }
  public getAttributeValue(): string {
    return this.attributeValue;
  }
}

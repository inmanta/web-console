import { AttributesSummary, Pairs, InstanceAttributeModel } from "@/Core";

type Attribute = null | unknown;

type Value = InstanceAttributeModel["key"];

export class AttributesPresenter {
  getSummary(
    candidate: Attribute,
    active: Attribute,
    rollback: Attribute
  ): AttributesSummary {
    return {
      candidate: candidate !== null,
      active: active !== null,
      rollback: rollback !== null,
    };
  }

  getPairsSafe(attributes: InstanceAttributeModel | null): Pairs | null {
    if (attributes === null) return null;
    return this.getPairs(attributes);
  }

  getPairs(attributes: InstanceAttributeModel): Pairs {
    return Object.entries(attributes).map(([key, value]) => [
      key,
      this.printValue(value),
    ]);
  }

  private printValue(value: Value): string {
    return Array.isArray(value)
      ? value.map((element) => JSON.stringify(element)).join(", ")
      : JSON.stringify(value);
  }
}

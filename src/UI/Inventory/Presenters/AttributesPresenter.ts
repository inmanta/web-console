import { IInstanceAttributeModel } from "@app/Models/LsmModels";
import { AttributesSummary, Pairs } from "@/Core";

type Attribute = null | unknown;

type Value = IInstanceAttributeModel["key"];

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

  getPairsSafe(attributes: IInstanceAttributeModel | null): Pairs | null {
    if (attributes === null) return null;
    return this.getPairs(attributes);
  }

  getPairs(attributes: IInstanceAttributeModel): Pairs {
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

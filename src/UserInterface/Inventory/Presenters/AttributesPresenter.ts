import { AttributesSummary } from "Core";

type Attribute = null | unknown;

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
}

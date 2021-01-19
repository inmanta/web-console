import { AttributeInfo } from "Core";

type Attribute = null | unknown;

export class AttributePresenter {
  get(
    candidate: Attribute,
    active: Attribute,
    rollback: Attribute
  ): AttributeInfo {
    return {
      candidate: candidate !== null,
      active: active !== null,
      rollback: rollback !== null,
    };
  }
}

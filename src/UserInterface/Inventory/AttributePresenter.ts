type Attribute = null | unknown;

export interface AttributeInfo {
  candidate: boolean;
  active: boolean;
  rollback: boolean;
}

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

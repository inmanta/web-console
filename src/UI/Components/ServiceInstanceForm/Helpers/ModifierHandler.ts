export interface ModifierHandler {
  /** Determines if the modifier of an attribute is valid for a use case  */
  validateModifier(modifier: string): boolean;
}

export class CreateModifierHandler implements ModifierHandler {
  validateModifier(modifier: string): boolean {
    return modifier !== "r";
  }
}

export class EditModifierHandler implements ModifierHandler {
  validateModifier(modifier: string): boolean {
    return modifier === "rw+";
  }
}

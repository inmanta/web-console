export interface ModifierHandler {
  /** Determines if the modifier of an attribute is valid for a use case  */
  validateModifier(modifier: string, embeddedEntity?: boolean): boolean;
}

export class CreateModifierHandler implements ModifierHandler {
  validateModifier(modifier: string): boolean {
    return modifier !== "r";
  }
}

export class EditModifierHandler implements ModifierHandler {
  validateModifier(modifier: string, embeddedEntity?: boolean): boolean {
    // Allow filling in the rw attributes of a new embedded entity
    if (embeddedEntity) {
      return modifier !== "r";
    }
    return modifier === "rw+";
  }
}

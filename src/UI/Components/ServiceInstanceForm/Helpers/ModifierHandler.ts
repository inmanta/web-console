/**
 * The ModifierHandler Interface
 *
 * - `rw` means: you can set it when creating
 * - `rw+`: you can set it when creating and when updating
 * - `r`: the orchestrator can set it, but you can't
 *
 * @param {string} modifier  a string that can be any of these options: ["rw", "rw+", "r"]
 * @param {boolean} [embeddedEntity] *optional* boolean value
 * @returns {boolean} boolean value
 */
export interface ModifierHandler {
  /** Determines if the modifier of an attribute is valid for a use case  */
  validateModifier(modifier: string, embeddedEntity?: boolean): boolean;
}

/**
 * - `rw` means: you can set it when creating
 * - `rw+`: you can set it when creating and when updating
 * - `r`: the orchestrator can set it, but you can't
 *
 *  @param {string} modifier  a string that can be any of these options: ["rw", "rw+", "r"]
 * @returns {boolean} boolean value
 */
export class CreateModifierHandler implements ModifierHandler {
  validateModifier(modifier: string): boolean {
    return modifier !== "r";
  }
}

/**
 * - `rw` means: you can set it when creating
 * - `rw+`: you can set it when creating and when updating
 * - `r`: the orchestrator can set it, but you can't
 *
 * @param {string} modifier  a string that can be any of these options: ["rw", "rw+", "r"]
 * @param {boolean} [embeddedEntity] *optional* boolean value
 * @returns {boolean} boolean value
 */
export class EditModifierHandler implements ModifierHandler {
  validateModifier(modifier: string, embeddedEntity?: boolean): boolean {
    // Allow filling in the rw attributes of a new embedded entity
    if (embeddedEntity) {
      return modifier !== "r";
    }
    return modifier === "rw+";
  }
}

import { words } from "@/UI/words";

export interface FormHelpProvider {
  getPlaceholderForType(typeName: string): string | undefined;
  getTypeHintForType(typeName: string): string | undefined;
}

export class FormHelpProviderImpl implements FormHelpProvider {
  getPlaceholderForType(typeName: string): string | undefined {
    if (typeName === "int[]") {
      return words("inventory.form.placeholder.intList");
    } else if (typeName === "float[]") {
      return words("inventory.form.placeholder.floatList");
    } else if (typeName.endsWith("[]")) {
      return words("inventory.form.placeholder.stringList");
    } else if (typeName.includes("dict")) {
      return words("inventory.form.placeholder.dict");
    }
    return undefined;
  }

  getTypeHintForType(typeName: string): string | undefined {
    if (typeName.endsWith("[]")) {
      return words("inventory.form.typeHint.list")(
        typeName.substring(0, typeName.indexOf("["))
      );
    } else if (typeName.includes("dict")) {
      return words("inventory.form.typeHint.dict");
    }
    return undefined;
  }
}

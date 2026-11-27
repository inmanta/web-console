import { words } from "@inmanta/web-console-core";
import type { editor } from "monaco-editor";

/**
 * Gets the errors to show for the value of the JSON editor: one for a value that isn't JSON, like
 * an empty one, and one for each marker Monaco found, like a schema violation.
 */
export const getJSONEditorErrors = (
  value: string,
  markers: Pick<editor.IMarker, "message" | "startLineNumber" | "startColumn">[]
): string[] => {
  const markerErrors = markers.map((marker) =>
    words("validation.marker")(marker.message, marker.startLineNumber, marker.startColumn)
  );

  return isJSON(value) ? markerErrors : [words("validation.empty"), ...markerErrors];
};

/** Whether the value parses as JSON. */
const isJSON = (value: string): boolean => {
  try {
    JSON.parse(value);

    return true;
  } catch (_error) {
    return false;
  }
};

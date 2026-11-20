import { Diff, Resource, words } from "@inmanta/web-console-core";
import { DIFF_SIDES, DiffSide, StatusAlertContent, ValueParts } from "./types";

/**
 * Splits both values of a changed attribute around the part that differs: what lies between the
 * start and the end the two values share. It compares characters, not UTF-16 code units, so an
 * emoji is never split in half.
 *
 * @example getChangedParts("644", "600") // { from: { commonStart: "6", changed: "44", commonEnd: "" }, to: { commonStart: "6", changed: "00", commonEnd: "" } }
 */
export const getChangedParts = (
  fromValue: string,
  toValue: string
): Record<DiffSide, ValueParts> => {
  const fromCharacters = Array.from(fromValue);
  const toCharacters = Array.from(toValue);
  const shortestLength = Math.min(fromCharacters.length, toCharacters.length);
  let commonStartLength = 0;

  while (
    commonStartLength < shortestLength &&
    fromCharacters[commonStartLength] === toCharacters[commonStartLength]
  ) {
    commonStartLength++;
  }

  let commonEndLength = 0;

  while (
    commonEndLength < shortestLength - commonStartLength &&
    fromCharacters[fromCharacters.length - 1 - commonEndLength] ===
      toCharacters[toCharacters.length - 1 - commonEndLength]
  ) {
    commonEndLength++;
  }

  const splitValue = (characters: string[]): ValueParts => ({
    commonStart: characters.slice(0, commonStartLength).join(""),
    changed: characters.slice(commonStartLength, characters.length - commonEndLength).join(""),
    commonEnd: characters.slice(characters.length - commonEndLength).join(""),
  });

  return { from: splitValue(fromCharacters), to: splitValue(toCharacters) };
};

/**
 * Gets a value as parts with nothing marked, for a resource that only has values on one side.
 */
export const getUnmarkedParts = (value: string): ValueParts => ({
  commonStart: value,
  changed: "",
  commonEnd: "",
});

/**
 * Whether an attribute holds a long value, one with more than one line on either side, like a
 * config or JSON. Long values are shown as a line diff instead of in the table cells.
 */
export const isLongValue = (fromValue: string, toValue: string): boolean =>
  fromValue.includes("\n") || toValue.includes("\n");

/**
 * Whether an attribute is the hash of a file resource (`fs::File`, or `std::File` on older
 * orchestrators), under which the server stores the file content.
 */
export const isFileHash = (resourceId: string, attributeName: string): boolean =>
  (resourceId.startsWith("fs::File[") || resourceId.startsWith("std::File[")) &&
  attributeName === "hash";

/**
 * Gets the sides of a diff that hold values for a resource: only the to side for an added
 * resource, only the from side for a deleted one, both otherwise.
 */
export const getSidesWithValues = (status: Diff.Status): DiffSide[] => {
  switch (status) {
    case "added":
      return ["to"];
    case "deleted":
      return ["from"];
    default:
      return DIFF_SIDES;
  }
};

/**
 * Gets the variant and title of the inline alert that explains the diff status of a resource.
 * Added and modified resources get none, since their attribute table and status label say it.
 */
export const getStatusAlertContent = (
  resourceId: string,
  status: Diff.Status
): StatusAlertContent | null => {
  switch (status) {
    case "deleted":
      return { variant: "danger", title: words("desiredState.compare.deleted") };
    case "unmodified":
      return { variant: "custom", title: words("desiredState.compare.unmodified") };
    case "agent_down": {
      const agentName = Resource.IdParser.getAgentName(resourceId) ?? "???";

      return { variant: "info", title: words("desiredState.compare.agent_down")(agentName) };
    }
    case "undefined":
      return { variant: "info", title: words("desiredState.compare.undefined") };
    case "skipped_for_undefined":
      return { variant: "info", title: words("desiredState.compare.skipped_for_undefined") };
    case "added":
    case "modified":
      return null;
  }
};

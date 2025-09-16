/**
 * Splitted parts of a resource id; Agent, value and type.
 */
export interface SplitResourceId {
  agent: string;
  value: string;
  type: string;
}

/**
 * Splits a resource id into its components. Agent, value and type.
 * @param {string}resourceId - The resource id to split.
 * @returns {SplitResourceId} - The split resource id.
 */
export const splitResourceId = (resourceId: string): SplitResourceId => {
  const regex = new RegExp(
    "^(?<type>[\\w-]+(?:::[\\w-]+)*::[\\w-]+)\\[(?<agent>[^,]+),(?:[^=]+)=(?<value>[^\\]]+)\\]?$",
    "gm"
  );
  const match = regex.exec(resourceId);
  if (!match) {
    throw new Error(`Invalid resource id: ${resourceId}`);
  }
  return {
    agent: match.groups?.agent ?? "",
    value: match.groups?.value ?? "",
    type: match.groups?.type ?? "",
  };
};

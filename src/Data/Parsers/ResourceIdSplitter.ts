export interface SplitResourceId {
    agent: string;
    value: string;
    type: string;
}

/**
 * Splits a resource id into its components. Agent, value and type.
 * @param resourceId - The resource id to split.
 * @returns {agent: string, value: string, type: string}
 */
export const splitResourceId = (resourceId: string): SplitResourceId => {
    const regex = new RegExp('^(?<type>[\\w-]+(?:::[\\w-]+)*::[\\w-]+)\\[(?<agent>[^,]+),(?:[^=]+)=(?<value>[^\\]]+)\\]?$', 'gm');
    const match = regex.exec(resourceId);
    if (!match) {
        throw new Error(`Invalid resource id: ${resourceId}`);
    }
    return {
        agent: match.groups?.agent ?? '',
        value: match.groups?.value ?? '',
        type: match.groups?.type ?? '',
    };
}
/**
 * Transforms any given string that is separated by hyphens and or underscore and or white spaces to title cased text with white spaces.
 *
 * @param rawString
 * @returns String
 */
export const convertToTitleCase = (rawString: string) => {
  const transformedString = rawString
    .toLowerCase()
    .replace(/[-_]+(.)/g, (_, char) => {
      return " " + char;
    }) // replace underscore or hyphens into white space and avoid multiple white spaces
    .replace(/[-_]/g, "") // remove any trailing underscores and hyphens
    .split(" ")
    .map((word) => {
      return word.length ? word.replace(word[0], word[0].toUpperCase()) : word;
    })
    .join(" ");

  return transformedString.trimStart().trimEnd(); // trim start and end of string from trailing white spaces
};

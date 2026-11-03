/**
 * Escapes a text with the browser's own HTML serialisation, so JointJS shows it as text where it
 * inserts content as HTML, such as the shape tooltips.
 */
export const escapeHtml = (text: string): string => {
  const element = document.createElement("span");

  element.textContent = text;

  return element.innerHTML;
};

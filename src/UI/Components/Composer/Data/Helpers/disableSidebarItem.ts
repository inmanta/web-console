/**
 * Changes the availability of stencil elements by toggling their CSS classes.
 *
 * This function enables or disables stencil elements for an inter-service relation instance by toggling specific CSS classes.
 *
 * @param {string} sidebarItemId - The name of the sidebar item.
 * @param {boolean} isDisabled - if true, adds the disabled className . If false, removes disabled className
 *
 * @returns {void}
 */
export const toggleDisabledSidebarItem = (sidebarItemId: string, isDisabled?: boolean): void => {
  //disable Inventory Stencil for inter-service relation instance
  const elements = [
    {
      selector: `[aria-labelledby="body_${sidebarItemId}"]`,
      className: "stencil_accent-disabled",
    },
    {
      selector: `[aria-labelledby="bodyTwo_${sidebarItemId}"]`,
      className: "stencil_body-disabled",
    },
    {
      selector: `[aria-labelledby="text_${sidebarItemId}"]`,
      className: "stencil_text-disabled",
    },
  ];

  elements.forEach(({ selector, className }) => {
    const element = document.querySelector(selector);

    if (element) {
      element.classList.toggle(className, isDisabled);
    }
  });
};

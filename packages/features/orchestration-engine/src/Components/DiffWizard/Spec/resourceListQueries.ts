/**
 * Test queries for the resource list of the diff, used by the Compliance Check and Desired State
 * Compare page tests.
 */
import { screen, within } from "@testing-library/react";
import { userEvent } from "@testing-library/user-event";
import { words } from "@inmanta/web-console-core";
import { getAttributeValueOrId } from "@inmanta/web-console-feature-orchestration-engine/Components/DiffWizard/helpers";

/**
 * Gets the resource rows of the resource list, the rows that mark whether they are current.
 */
export const getResourceListRows = (): HTMLElement[] =>
  within(screen.getByRole("grid", { name: words("resources") }))
    .getAllByRole("row")
    .filter((row) => row.hasAttribute("aria-current"));

/**
 * Waits for the resource list, then gets its resource rows.
 */
export const findResourceListRows = async (): Promise<HTMLElement[]> => {
  await screen.findAllByRole("row", { current: true });

  return getResourceListRows();
};

/**
 * Gets the row of a resource in the resource list, by the value of its id.
 */
export const getResourceListRow = (resourceId: string): HTMLElement => {
  const idValue = getAttributeValueOrId(resourceId);
  const row = getResourceListRows().find((candidate) => within(candidate).queryByText(idValue));

  if (!row) {
    throw new Error(`No resource list row for ${resourceId}`);
  }

  return row;
};

/**
 * Selects a resource in the resource list, so the diff pane shows its diff.
 */
export const selectResource = async (resourceId: string): Promise<void> => {
  await screen.findAllByRole("row", { current: true });
  await userEvent.click(getResourceListRow(resourceId));
};

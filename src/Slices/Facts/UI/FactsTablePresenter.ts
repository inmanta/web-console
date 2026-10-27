import { words } from "@inmanta/web-console-core";
import { Fact } from "@inmanta/web-console-core/Domain/Fact";
import { createTablePresenter } from "@inmanta/web-console-ui/Presenters";

/**
 * Table presenter for the Facts view. Rows are the facts unchanged.
 *
 * @example createFactsTablePresenter().getSortableColumnNames() // ["name", "resource_id"]
 */
export const createFactsTablePresenter = () =>
  createTablePresenter<Fact, Fact>({
    columnHeads: [
      { displayName: words("name"), apiName: "name" },
      { displayName: words("updated"), apiName: "updated" },
      { displayName: words("value"), apiName: "value" },
      { displayName: words("resourceId"), apiName: "resource_id" },
    ],
    sortableColumns: ["name", "resource_id"],
    createRows: (facts) => facts,
  });

export type FactsTablePresenter = ReturnType<typeof createFactsTablePresenter>;

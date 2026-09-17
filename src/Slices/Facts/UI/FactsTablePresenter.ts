import { ColumnHead, createTablePresenter } from "@/UI/Presenters";
import { words } from "@/UI/words";
import { Fact } from "@S/Facts/Core/Domain";

const columnHeads: ColumnHead[] = [
  { displayName: words("name"), apiName: "name" },
  { displayName: words("updated"), apiName: "updated" },
  { displayName: words("value"), apiName: "value" },
  { displayName: words("resourceId"), apiName: "resource_id" },
];

/**
 * Table presenter for the Facts view. Rows are the facts unchanged.
 *
 * @example createFactsTablePresenter().getSortableColumnNames() // ["name", "resource_id"]
 */
export const createFactsTablePresenter = () =>
  createTablePresenter<Fact, Fact>({
    columnHeads,
    sortableColumns: ["name", "resource_id"],
    createRows: (facts) => facts,
  });

export type FactsTablePresenter = ReturnType<typeof createFactsTablePresenter>;

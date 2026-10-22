import { words } from "@/Core";
import { Fact } from "@/Core/Domain/Fact";
import { ColumnHead, createTablePresenter } from "@/UI/Presenters";

const getColumnHeads = (): ColumnHead[] => [
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
    columnHeads: getColumnHeads(),
    sortableColumns: ["name", "resource_id"],
    createRows: (facts) => facts,
  });

export type FactsTablePresenter = ReturnType<typeof createFactsTablePresenter>;

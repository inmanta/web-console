import { Parameter } from "@/Core";
import { ColumnHead, createTablePresenter } from "@/UI/Presenters";
import { words } from "@/UI/words";

const columnHeads: ColumnHead[] = [
  { displayName: words("name"), apiName: "name" },
  { displayName: words("lastUpdated"), apiName: "updated" },
  { displayName: words("parameters.columns.source"), apiName: "source" },
  { displayName: words("value"), apiName: "value" },
];

/**
 * Table presenter for the parameters view. Rows are the parameters unchanged.
 *
 * @example createParametersTablePresenter().getSortableColumnNames() // ["name", "source", "updated"]
 */
export const createParametersTablePresenter = () =>
  createTablePresenter<Parameter, Parameter>({
    columnHeads,
    sortableColumns: ["name", "source", "updated"],
    extraColumns: 1,
    createRows: (parameters) => parameters,
  });

export type ParametersTablePresenter = ReturnType<typeof createParametersTablePresenter>;

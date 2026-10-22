import { Parameter, words } from "@/Core";
import { ColumnHead, createTablePresenter } from "@/UI/Presenters";

const getColumnHeads = (): ColumnHead[] => [
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
    columnHeads: getColumnHeads(),
    sortableColumns: ["name", "source", "updated"],
    createRows: (parameters) => parameters,
  });

export type ParametersTablePresenter = ReturnType<typeof createParametersTablePresenter>;

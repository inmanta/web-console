import { Parameter, words } from "@inmanta/web-console-core";
import { createTablePresenter } from "@inmanta/web-console-ui/Presenters";

/**
 * Table presenter for the parameters view. Rows are the parameters unchanged.
 *
 * @example createParametersTablePresenter().getSortableColumnNames() // ["name", "source", "updated"]
 */
export const createParametersTablePresenter = () =>
  createTablePresenter<Parameter, Parameter>({
    columnHeads: [
      { displayName: words("name"), apiName: "name" },
      { displayName: words("lastUpdated"), apiName: "updated" },
      { displayName: words("parameters.columns.source"), apiName: "source" },
      { displayName: words("value"), apiName: "value" },
    ],
    sortableColumns: ["name", "source", "updated"],
    createRows: (parameters) => parameters,
  });

export type ParametersTablePresenter = ReturnType<typeof createParametersTablePresenter>;

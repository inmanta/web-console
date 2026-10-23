import { words } from "@/Core";
import { ResourceHistory } from "@/Core/Domain/ResourceHistory";
import { ResourceHistoryRow } from "@/Slices/ResourceDetails/Core/Types";
import { ColumnHead, createTablePresenter } from "@/UI/Presenters";

const getColumnHeads = (): ColumnHead[] => [
  { displayName: words("date"), apiName: "date" },
  { displayName: words("requires"), apiName: "requires" },
];

/**
 * Table presenter for the resource history tab. Only the date column is sortable.
 *
 * @example createResourceHistoryTablePresenter().getSortableColumnNames() // ["date"]
 */
export const createResourceHistoryTablePresenter = () =>
  createTablePresenter<ResourceHistory, ResourceHistoryRow>({
    columnHeads: getColumnHeads(),
    sortableColumns: ["date"],
    extraColumns: 1,
    createRows: (history) =>
      history.map((resource) => ({
        attribute_hash: resource.attribute_hash,
        attributes: resource.attributes,
        date: resource.date,
        numberOfDependencies: resource.requires.length,
        requires: resource.requires,
        id: `${resource.attribute_hash}-${resource.date}`,
      })),
  });

export type ResourceHistoryTablePresenter = ReturnType<typeof createResourceHistoryTablePresenter>;

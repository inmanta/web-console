import React from "react";
import { ServiceModel } from "@/Core";
import { useNavigateTo } from "@/UI";
import { TreeTable, TreeTableCellContext } from "@/UI/Components";
import {
  CatalogAttributeHelper,
  CatalogTreeTableHelper,
} from "@/UI/Components/TreeTable/Catalog";
import {
  PathHelper,
  TreeExpansionManager,
} from "@/UI/Components/TreeTable/Helpers";

interface Props {
  service: ServiceModel;
}

export const AttributeTable: React.FunctionComponent<Props> = ({ service }) => {
  const navigate = useNavigateTo();
  if (
    service.attributes.length > 0 ||
    service.embedded_entities.length > 0 ||
    (service.inter_service_relations &&
      service.inter_service_relations.length > 0)
  ) {
    return (
      <TreeTableCellContext.Provider
        value={{
          onClick: (value) =>
            navigate(
              "ServiceDetails",
              { service: value },
              `?env=${service?.environment}`
            ),
        }}
      >
        <TreeTable
          treeTableHelper={
            new CatalogTreeTableHelper(
              new PathHelper("$"),
              new TreeExpansionManager("$"),
              new CatalogAttributeHelper("$"),
              service
            )
          }
        />
      </TreeTableCellContext.Provider>
    );
  }

  return <div>No attributes found for the service</div>;
};

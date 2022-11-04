import React from "react";
import { ServiceModel } from "@/Core";
import { TreeTable } from "@/UI/Components";
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
  if (
    service.attributes.length > 0 ||
    service.embedded_entities.length > 0 ||
    (service.inter_service_relations &&
      service.inter_service_relations.length > 0)
  ) {
    return (
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
    );
  }

  return <div>No attributes found for the service</div>;
};

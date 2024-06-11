import React from "react";
import { Attributes, ParsedNumber, ServiceModel } from "@/Core";
import { useNavigateTo } from "@/UI";
import { TreeTable, TreeTableCellContext } from "@/UI/Components";
import {
  PathHelper,
  TreeExpansionManager,
} from "@/UI/Components/TreeTable/Helpers";
import {
  InventoryAttributeHelper,
  InventoryTreeTableHelper,
} from "@/UI/Components/TreeTable/Inventory";

interface Props {
  attributes: Attributes;
  service?: ServiceModel;
  id?: string;
  version: ParsedNumber;
  setTab?: (tab: string) => void;
}

export const AttributesTab: React.FC<Props> = ({
  attributes,
  id,
  service,
  version,
  setTab = () => {},
}) => {
  const navigate = useNavigateTo();
  return (
    <TreeTableCellContext.Provider
      value={{
        onClick: (value, serviceName) => {
          navigate(
            "Inventory",
            { service: serviceName as string },
            `?env=${service?.environment}&state.Inventory.filter.id_or_service_identity[0]=${value}`,
          );
        },
      }}
    >
      <TreeTable
        treeTableHelper={
          new InventoryTreeTableHelper(
            new PathHelper("$"),
            new TreeExpansionManager("$"),
            new InventoryAttributeHelper("$", service),
            attributes,
          )
        }
        setTab={setTab}
        id={id}
        serviceName={service?.name}
        version={version}
        isExpertAvailable
      />
    </TreeTableCellContext.Provider>
  );
};

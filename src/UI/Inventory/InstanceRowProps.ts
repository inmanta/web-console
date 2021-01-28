import { Row } from "@/Core";
import { OnCollapse } from "@patternfly/react-table";

export interface InstanceRowProps {
  row: Row;
  index: number;
  isExpanded: boolean;
  onToggle: OnCollapse;
  numberOfColumns: number;
}

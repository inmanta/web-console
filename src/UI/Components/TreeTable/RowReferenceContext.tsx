import { createContext } from "react";

interface TreeTableCell {
  onClick: (cellValue: string, serviceName?: string) => void;
}

export const TreeTableCellContext = createContext<TreeTableCell>({
  onClick: () => {
    // Default to no-op
    return;
  },
});

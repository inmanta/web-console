import React, { useContext } from "react";
import { DropdownItem } from "@patternfly/react-core";
import { ParsedNumber } from "@/Core";
import { words } from "@/UI/words";
import { GetDesiredStatesContext } from "../GetDesiredStatesContext";

interface Props {
  version: ParsedNumber;
}

export const DeleteAction: React.FC<Props> = ({ version }) => {
  const { setDeleteModal } = useContext(GetDesiredStatesContext);
  return (
    <DropdownItem onClick={() => setDeleteModal(version, true)}>
      {words("desiredState.actions.delete")}
    </DropdownItem>
  );
};

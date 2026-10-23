import React, { useContext } from "react";
import { DropdownItem } from "@patternfly/react-core";
import { ParsedNumber, words } from "@/Core";
import { GetDesiredStatesContext } from "../GetDesiredStatesContext";

interface Props {
  version: ParsedNumber;
}

export const DeleteAction: React.FC<Props> = ({ version }) => {
  const { setDeleteModal } = useContext(GetDesiredStatesContext);

  return (
    <DropdownItem onClick={() => setDeleteModal(version, true)}>{words("delete")}</DropdownItem>
  );
};

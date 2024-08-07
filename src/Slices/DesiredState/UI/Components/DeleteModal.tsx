import React, { useContext } from "react";
import { Modal } from "@patternfly/react-core";
import { DeleteVersion } from "@/Data/Managers/DeleteVersion/interface";
import { ConfirmUserActionForm } from "@/UI/Components";
import { DependencyContext } from "@/UI/Dependency";
import { words } from "@/UI/words";
import { GetDesiredStatesContext } from "../GetDesiredStatesContext";

interface Props extends DeleteVersion {
  isDisabled?: boolean;
  isOpened: boolean;
}

export const DeleteModal: React.FC<Props> = ({ version, isOpened }) => {
  const { setDeleteModal } = useContext(GetDesiredStatesContext);
  const { commandResolver } = useContext(DependencyContext);
  const { filter, pageSize, currentPage } = useContext(GetDesiredStatesContext);
  const deleteVersionTrigger = commandResolver.useGetTrigger<"DeleteVersion">({
    kind: "DeleteVersion",
    version,
  });

  const onSubmit = async () => {
    await deleteVersionTrigger({
      kind: "GetDesiredStates",
      filter,
      pageSize,
      currentPage,
    });
    setDeleteModal(0, false);
  };

  return (
    <Modal
      disableFocusTrap
      isOpen={isOpened}
      title={words("inventory.deleteVersion.title")}
      variant={"small"}
      onClose={() => setDeleteModal(0, false)}
    >
      {words("inventory.deleteVersion.header")(version)}
      <ConfirmUserActionForm
        onSubmit={onSubmit}
        onCancel={() => setDeleteModal(0, false)}
      />
    </Modal>
  );
};

import React, { useState } from "react";
import {
  CardActions,
  Dropdown,
  DropdownItem,
  KebabToggle,
} from "@patternfly/react-core";
import { PencilAltIcon, TrashAltIcon } from "@patternfly/react-icons";
import { FlatEnvironment } from "@/Core";
import { useGoTo } from "@/UI/Routing";
import { words } from "@/UI/words";
import { DeleteModal } from "./DeleteModal";

interface ActionsProps {
  environment: Pick<FlatEnvironment, "id" | "name">;
}

export const Actions: React.FC<ActionsProps> = ({ environment }) => {
  const [isToggleOpen, setIsToggleOpen] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const goTo = useGoTo();
  return (
    <>
      <DeleteModal
        environment={environment}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />
      <CardActions>
        <Dropdown
          onSelect={() => setIsToggleOpen((value) => !value)}
          toggle={
            <KebabToggle onToggle={() => setIsToggleOpen((value) => !value)} />
          }
          isOpen={isToggleOpen}
          isPlain
          dropdownItems={[
            <DropdownItem
              key="edit environment"
              icon={<PencilAltIcon />}
              onClick={() =>
                goTo("Settings", undefined, `env=${environment.id}`)
              }
            >
              {words("home.environment.edit")}
            </DropdownItem>,
            <DropdownItem
              key="delete environment"
              icon={<TrashAltIcon />}
              onClick={() => setIsModalOpen(true)}
            >
              {words("home.environment.delete")}
            </DropdownItem>,
          ]}
          position={"right"}
        />
      </CardActions>
    </>
  );
};

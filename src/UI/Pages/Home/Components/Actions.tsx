import React, { useState } from "react";
import {
  CardActions,
  Dropdown,
  DropdownItem,
  KebabToggle,
} from "@patternfly/react-core";
import { CopyIcon, PencilAltIcon, TrashAltIcon } from "@patternfly/react-icons";
import { FullEnvironment } from "@/Core";
import { useNavigateTo } from "@/UI/Routing";
import { words } from "@/UI/words";
import { DeleteModal } from "./DeleteModal";
import copy from "copy-to-clipboard";

interface ActionsProps {
  environment: Pick<FullEnvironment, "id" | "name">;
}

export const Actions: React.FC<ActionsProps> = ({ environment }) => {
  const [isToggleOpen, setIsToggleOpen] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const navigateTo = useNavigateTo();
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
                navigateTo("Settings", undefined, `env=${environment.id}`)
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
            <DropdownItem
              key="copy id"
              icon={<CopyIcon />}
              onClick={() => copy(environment.id)}
            >
              {words("home.environment.copy")}
            </DropdownItem>,
          ]}
          position={"right"}
        />
      </CardActions>
    </>
  );
};

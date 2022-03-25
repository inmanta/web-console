import React, { useState } from "react";
import {
  Button,
  DescriptionListDescription,
  DescriptionListGroup,
  DescriptionListTerm,
} from "@patternfly/react-core";
import { TrashAltIcon } from "@patternfly/react-icons";
import { FlatEnvironment } from "@/Core";
import { TextWithCopy } from "@/UI/Components";
import { words } from "@/UI/words";
import { DeleteModal } from "./DeleteModal";

interface ActionsProps {
  environment: Pick<FlatEnvironment, "id" | "name">;
}

export const Actions: React.FC<ActionsProps> = ({ environment }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  return (
    <>
      <DescriptionListGroup>
        <DescriptionListTerm>
          {words("settings.tabs.environment.id")}
        </DescriptionListTerm>
        <DescriptionListDescription>
          <TextWithCopy
            value={environment.id}
            tooltipContent={words("home.environment.copy")}
          />
        </DescriptionListDescription>
      </DescriptionListGroup>
      <DescriptionListGroup>
        <DescriptionListDescription>
          <Button
            variant="danger"
            onClick={() => setIsModalOpen(true)}
            icon={<TrashAltIcon />}
          >
            {words("home.environment.delete")}
          </Button>
        </DescriptionListDescription>
      </DescriptionListGroup>

      <DeleteModal
        environment={environment}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />
    </>
  );
};

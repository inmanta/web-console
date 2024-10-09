import React, { useContext } from "react";
import {
  Button,
  DescriptionListDescription,
  DescriptionListGroup,
  DescriptionListTerm,
} from "@patternfly/react-core";
import { TrashAltIcon } from "@patternfly/react-icons";
import { FlatEnvironment } from "@/Core";
import { ActionDisabledTooltip, TextWithCopy } from "@/UI/Components";
import { DependencyContext } from "@/UI/Dependency";
import { ModalContext } from "@/UI/Root/Components/ModalProvider";
import { words } from "@/UI/words";
import { ConfirmationForm } from "./ConfirmationForm";

interface ActionsProps {
  environment: Pick<FlatEnvironment, "id" | "name">;
}

export const Actions: React.FC<ActionsProps> = ({ environment }) => {
  const { triggerModal } = useContext(ModalContext);
  const { environmentModifier } = useContext(DependencyContext);
  const isProtected = environmentModifier.useIsProtectedEnvironment();

  /**
   * Opens a modal with a confirmation form.
   */
  const openModal = (type: "delete" | "clear") => {
    triggerModal({
      title: words("home.environment.delete.warning"),
      description: (
        <p>
          {words(`home.environment.${type}.confirmation`)(environment.name)}
        </p>
      ),
      iconVariant: "danger",
      content: <ConfirmationForm environment={environment} type={type} />,
    });
  };

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
          <ActionDisabledTooltip
            isDisabled={isProtected}
            testingId={"clear"}
            tooltipContent={words("environment.protected.tooltip")}
          >
            <Button
              variant="secondary"
              isDanger
              onClick={() => openModal("clear")}
              isDisabled={isProtected}
            >
              {words("home.environment.clear")}
            </Button>
          </ActionDisabledTooltip>
        </DescriptionListDescription>
      </DescriptionListGroup>
      <DescriptionListGroup>
        <DescriptionListDescription>
          <ActionDisabledTooltip
            isDisabled={isProtected}
            testingId={"delete"}
            tooltipContent={words("environment.protected.tooltip")}
          >
            <Button
              variant="danger"
              onClick={() => openModal("delete")}
              icon={<TrashAltIcon />}
              isDisabled={isProtected}
            >
              {words("home.environment.delete")}
            </Button>
          </ActionDisabledTooltip>
        </DescriptionListDescription>
      </DescriptionListGroup>
    </>
  );
};

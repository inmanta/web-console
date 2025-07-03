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

export type EnvActions = "delete" | "clear";

interface Props {
  environment: Pick<FlatEnvironment, "id" | "name">;
}

/**
 * Actions component.
 * @props {Props} props - The component props.
 * @prop {FlatEnvironment} environment - An object that represents the environment. It is a subset of the `FlatEnvironment` type, including only the `id` and `name` properties.
 *
 * @returns {React.FC<Props>} - The rendered actions component.
 */
export const Actions: React.FC<Props> = ({ environment }) => {
  const { triggerModal } = useContext(ModalContext);
  const { environmentHandler } = useContext(DependencyContext);
  const isProtected = environmentHandler.useIsProtectedEnvironment();

  /**
   * Opens a modal with a confirmation form.
   * @param {string} type - The type of operation. It can be either "delete" or "clear".
   *
   * @returns {void}
   */
  const openModal = (type: EnvActions): void => {
    triggerModal({
      title: words("home.environment.delete.warning"),
      description: <p>{words(`home.environment.${type}.confirmation`)(environment.name)}</p>,
      iconVariant: "danger",
      content: <ConfirmationForm environment={environment} type={type} />,
    });
  };

  return (
    <>
      <DescriptionListGroup>
        <DescriptionListTerm>{words("settings.tabs.environment.id")}</DescriptionListTerm>
        <DescriptionListDescription>
          <TextWithCopy value={environment.id} tooltipContent={words("home.environment.copy")} />
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

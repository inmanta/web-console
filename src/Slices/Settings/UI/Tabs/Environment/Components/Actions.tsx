import React, { useContext, useState } from "react";
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
import { useNavigateTo } from "@/UI/Routing";
import { words } from "@/UI/words";
import { ConfirmationModal } from "./ConfirmationModal";

interface ActionsProps {
  environment: Pick<FlatEnvironment, "id" | "name">;
}

export const Actions: React.FC<ActionsProps> = ({ environment }) => {
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isClearModalOpen, setIsClearModalOpen] = useState(false);
  const { commandResolver, environmentModifier } =
    useContext(DependencyContext);
  const navigateTo = useNavigateTo();
  const redirectToHome = () => navigateTo("Home", undefined);
  const deleteTrigger = commandResolver.useGetTrigger<"DeleteEnvironment">({
    kind: "DeleteEnvironment",
    id: environment.id,
  });
  const clearTrigger = commandResolver.useGetTrigger<"ClearEnvironment">({
    kind: "ClearEnvironment",
    id: environment.id,
  });
  const isProtected = environmentModifier.useIsProtectedEnvironment();
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
            ariaLabel={"clear"}
            tooltipContent={words("environment.protected.tooltip")}
          >
            <Button
              variant="secondary"
              isDanger
              onClick={() => setIsClearModalOpen(true)}
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
            ariaLabel={"delete"}
            tooltipContent={words("environment.protected.tooltip")}
          >
            <Button
              variant="danger"
              onClick={() => setIsDeleteModalOpen(true)}
              icon={<TrashAltIcon />}
              isDisabled={isProtected}
            >
              {words("home.environment.delete")}
            </Button>
          </ActionDisabledTooltip>
        </DescriptionListDescription>
      </DescriptionListGroup>
      <ConfirmationModal
        actionType="delete"
        environment={environment.name}
        isOpen={isDeleteModalOpen}
        onConfirm={deleteTrigger}
        onClose={() => setIsDeleteModalOpen(false)}
        onSuccess={redirectToHome}
      />
      <ConfirmationModal
        actionType="clear"
        environment={environment.name}
        isOpen={isClearModalOpen}
        onConfirm={clearTrigger}
        onClose={() => setIsClearModalOpen(false)}
      />
    </>
  );
};

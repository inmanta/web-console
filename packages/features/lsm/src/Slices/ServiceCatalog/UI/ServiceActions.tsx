import React, { useContext, useState } from "react";
import {
  DataListAction,
  Dropdown,
  DropdownItem,
  DropdownList,
  MenuToggle,
  MenuToggleElement,
} from "@patternfly/react-core";
import { EllipsisVIcon } from "@patternfly/react-icons";
import { words } from "@inmanta/web-console-core";
import { DependencyContext } from "@inmanta/web-console-core/Dependency";
import { useAppAlert } from "@inmanta/web-console-core/Dependency/AppAlertContext";
import { ModalContext } from "@inmanta/web-console-core/Dependency/ModalContext";
import { useDeleteService } from "@inmanta/web-console-core/Queries/Slices/Service";
import { ConfirmUserActionForm } from "@inmanta/web-console-ui/Components/ConfirmUserActionForm";
import { Link } from "@inmanta/web-console-ui/Components/Link";
import { CatalogService } from "./types";

interface Props {
  service: CatalogService;
  titleId: string;
}

/**
 * The actions menu of a service in the catalog data list, with details and delete.
 *
 * @props {Props} props - The props of the component.
 *  @prop {CatalogService} service - The service the actions apply to.
 *  @prop {string} titleId - The id of the service title, which labels the actions together with their own id.
 *
 * @returns {React.FC<Props>} The data list action of the service.
 */
export const ServiceActions: React.FC<Props> = ({ service, titleId }) => {
  const serviceName = service.serviceModel.name;
  const actionsId = `${serviceName}-actions`;
  const { triggerModal, closeModal } = useContext(ModalContext);
  const { routeManager } = useContext(DependencyContext);
  const [isOpen, setIsOpen] = useState(false);
  const { notifyError } = useAppAlert();
  const { mutate } = useDeleteService(serviceName, {
    onError: (error) =>
      notifyError({
        title: words("catalog.delete.failed"),
        message: error.message,
      }),
  });

  /**
   * Handles the submission of deleting the service.
   */
  const onSubmit = (): void => {
    closeModal();
    mutate();
  };

  /**
   * Opens a modal with a confirmation form.
   */
  const openModal = (): void => {
    triggerModal({
      title: words("catalog.delete.modal.title"),
      content: (
        <>
          {words("catalog.delete.title")(serviceName)}
          <ConfirmUserActionForm onSubmit={onSubmit} onCancel={closeModal} />
        </>
      ),
    });
  };

  return (
    <DataListAction
      id={actionsId}
      aria-labelledby={`${titleId} ${actionsId}`}
      aria-label={words("actions")}
    >
      <Dropdown
        isOpen={isOpen}
        onSelect={() => setIsOpen(false)}
        onOpenChange={(isOpen: boolean) => setIsOpen(isOpen)}
        popperProps={{ position: "right" }}
        toggle={(toggleRef: React.Ref<MenuToggleElement>) => (
          <MenuToggle
            ref={toggleRef}
            aria-label="Actions-dropdown"
            variant="plain"
            isExpanded={isOpen}
            onClick={() => setIsOpen(!isOpen)}
            icon={<EllipsisVIcon />}
          />
        )}
      >
        <DropdownList>
          <DropdownItem>
            <Link pathname={routeManager.getUrl("ServiceDetails", { service: serviceName })}>
              {words("showDetails")}
            </Link>
          </DropdownItem>
          <DropdownItem onClick={openModal} aria-label={serviceName + "-deleteButton"}>
            {words("delete")}
          </DropdownItem>
        </DropdownList>
      </Dropdown>
    </DataListAction>
  );
};

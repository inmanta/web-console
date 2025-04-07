import React, { useCallback, useContext, useState } from "react";
import "@inmanta/rappid/joint-plus.css";
import { useLocation, useNavigate } from "react-router-dom";
import { AlertVariant, Button, Flex, FlexItem } from "@patternfly/react-core";
import {
  usePostMetadata,
  usePostOrder,
} from "@/Data/Managers/V2/ServiceInstance";
import { ServiceOrder } from "@/Slices/Orders/Core/Query";
import { DependencyContext } from "@/UI/Dependency";
import { words } from "@/UI/words";
import { ToastAlert } from "../../ToastAlert";
import { CanvasContext, InstanceComposerContext } from "../Context/Context";
import { getServiceOrderItems } from "../helpers";
import { SavedCoordinates } from "../interfaces";

/**
 * Properties for the ComposerActions component.
 *
 * @interface
 * @prop {string} serviceName - The name of the service.
 * @prop {boolean} editable - A flag indicating if the diagram is editable.
 */
interface Props {
  serviceName: string;
  editable: boolean;
}

/**
 * ComposerActions component
 *
 * This component represents the actions for the Composer.
 * It contains controls to cancel creating or editing instance or sending serviceOrderItems to the backend.
 * Also, it shows feedback notification to the user.
 *
 * @props {Props} props - The properties passed to the component.
 * @prop {string} props.serviceName - The name of the service.
 * @prop {boolean} props.editable - A flag indicating if the diagram is editable.
 * @prop {DiagramHandlers | null} props.diagramHandlers - The handlers for various diagram actions.
 *
 * @returns {React.FC} The ComposerActions component.
 */
export const ComposerActions: React.FC<Props> = ({ serviceName, editable }) => {
  const { serviceModels, mainService, instance } = useContext(
    InstanceComposerContext,
  );
  const {
    serviceOrderItems,
    isDirty,
    looseElement,
    diagramHandlers,
    interServiceRelationsOnCanvas,
  } = useContext(CanvasContext);
  const { routeManager } = useContext(DependencyContext);

  const [alertMessage, setAlertMessage] = useState("");
  const [alertType, setAlertType] = useState(AlertVariant.danger);
  const location = useLocation();

  const metadataMutation = usePostMetadata();
  const orderMutation = usePostOrder({
    onSuccess: (response: { data: ServiceOrder }) => {
      const newUrl = routeManager.getUrl("OrderDetails", {
        id: response.data.id,
      });

      navigate(`${newUrl}${location.search}`);
    },
    onError: (response: Error) => {
      setAlertType(AlertVariant.danger);
      setAlertMessage(response.message);
    },
  });

  const navigate = useNavigate();
  const url = routeManager.useUrl("Inventory", {
    service: serviceName,
  });
  const handleRedirect = useCallback(() => navigate(url), [navigate, url]);

  /**
   * Handles the filtering of the unchanged entities and sending serviceOrderItems to the backend.
   *
   */
  const handleDeploy = () => {
    let coordinates: SavedCoordinates[] = [];

    if (!diagramHandlers) {
      setAlertType(AlertVariant.danger);
      setAlertMessage(
        words("instanceComposer.errorMessage.coordinatesRequest"),
      );
    } else {
      coordinates = diagramHandlers.getCoordinates();
    }

    const orderItems = getServiceOrderItems(serviceOrderItems, serviceModels)
      .filter((item) => item.action !== null)
      .map((instance) => ({
        ...instance,
        metadata: {
          coordinates: JSON.stringify({
            version: "v2",
            data: coordinates,
          }),
        },
      }));

    // Temporary workaround to update coordinates in metadata, as currently order endpoint don't handle metadata in the updates.
    // can't test in jest as I can't add any test-id to the halo handles though.
    if (instance) {
      metadataMutation.mutate({
        service_entity: mainService.name,
        service_id: instance.instance.id,
        key: "coordinates",
        body: {
          current_version: instance.instance.version,
          value: JSON.stringify({
            version: "v2",
            data: coordinates,
          }),
        },
      });
    }

    orderMutation.mutate(orderItems);
  };
  const missingInterServiceRelations = Array.from(
    interServiceRelationsOnCanvas,
  ).filter(
    ([_key, value]) =>
      value.relations.filter(
        (relation) => relation.currentAmount < relation.min,
      ).length > 0,
  );

  return (
    <Flex
      justifyContent={{
        default: "justifyContentFlexEnd",
      }}
      alignItems={{ default: "alignItemsFlexEnd" }}
    >
      {alertMessage && (
        <ToastAlert
          data-testid="ToastAlert"
          title={
            alertType === AlertVariant.success
              ? words("instanceComposer.success.title")
              : words("instanceComposer.failed.title")
          }
          message={alertMessage}
          setMessage={setAlertMessage}
          type={alertType}
        />
      )}
      <FlexItem>
        <Flex
          spacer={{ default: "spacerMd" }}
          alignItems={{ default: "alignItemsCenter" }}
        >
          <Button variant="tertiary" width={200} onClick={handleRedirect}>
            {words("cancel")}
          </Button>
          <Button
            variant="primary"
            width={200}
            onClick={handleDeploy}
            isDisabled={
              serviceOrderItems.size < 1 ||
              !isDirty ||
              looseElement.size > 0 ||
              !editable ||
              missingInterServiceRelations.length > 0
            }
          >
            {words("deploy")}
          </Button>
        </Flex>
      </FlexItem>
    </Flex>
  );
};

import React, { useCallback, useContext, useState } from "react";
import "@rappidcss";
import { useLocation, useNavigate } from "react-router";
import { AlertVariant, Button, Flex, FlexItem } from "@patternfly/react-core";
import { usePostOrder, usePostMetadata } from "@/Data/Queries";
import { useGetInstanceWithRelations } from "@/Data/Queries";
import { ServiceOrder } from "@/Slices/Orders/Core/Types";
import { ToastAlert } from "@/UI/Components/ToastAlert/ToastAlert";
import { DependencyContext } from "@/UI/Dependency";
import { words } from "@/UI/words";
import { ComposerContext } from "../Data/Context";
import { getServiceOrderItemsArray, SavedCoordinates } from "../Data/Helpers";

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
 *
 * @returns {React.FC} The ComposerActions component.
 */
export const ComposerActions: React.FC<Props> = ({ serviceName, editable }) => {
  const { mainService, serviceInstanceId, serviceOrderItems, canvasHandlers, hasValidationErrors } =
    useContext(ComposerContext);
  const { routeManager } = useContext(DependencyContext);

  const isDisabled = serviceOrderItems.size < 1 || hasValidationErrors;

  const [alertMessage, setAlertMessage] = useState("");
  const [alertType, setAlertType] = useState(AlertVariant.danger);
  const location = useLocation();

  // Fetch instance data if we're editing
  const instanceWithRelationsQuery = useGetInstanceWithRelations(
    serviceInstanceId || "",
    false,
    mainService || undefined
  ).useOneTime();

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

    if (!canvasHandlers) {
      setAlertType(AlertVariant.danger);
      setAlertMessage(words("instanceComposer.errorMessage.coordinatesRequest"));
    } else {
      coordinates = canvasHandlers.getCoordinates();
    }

    const orderItems = getServiceOrderItemsArray(serviceOrderItems).map((instance) => ({
      ...instance,
      metadata: {
        coordinates: JSON.stringify({
          version: "v2",
          data: coordinates,
        }),
      },
    }));

    // Temporary workaround to update coordinates in metadata, as currently order endpoint don't handle metadata in the updates.
    if (serviceInstanceId && instanceWithRelationsQuery.data) {
      metadataMutation.mutate({
        service_entity: mainService?.name || "",
        service_id: instanceWithRelationsQuery.data.instance.id,
        key: "coordinates",
        body: {
          current_version: instanceWithRelationsQuery.data.instance.version,
          value: JSON.stringify({
            version: "v2",
            data: coordinates,
          }),
        },
      });
    }

    orderMutation.mutate(orderItems);
  };

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
        <Flex spacer={{ default: "spacerMd" }} alignItems={{ default: "alignItemsCenter" }}>
          <Button variant="tertiary" width={200} onClick={handleRedirect}>
            {words("cancel")}
          </Button>
          {editable && (
            <Button
              variant="primary"
              width={200}
              onClick={handleDeploy}
              isDisabled={isDisabled}
              data-testid="deploy-button"
            >
              {words("deploy")}
            </Button>
          )}
        </Flex>
      </FlexItem>
    </Flex>
  );
};

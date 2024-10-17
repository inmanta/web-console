import React, { useCallback, useContext, useEffect, useState } from "react";
import "@inmanta/rappid/joint-plus.css";
import { useNavigate } from "react-router-dom";
import { AlertVariant, Button, Flex, FlexItem } from "@patternfly/react-core";
import styled from "styled-components";
import { usePostMetadata } from "@/Data/Managers/V2/POST/PostMetadata";
import { usePostOrder } from "@/Data/Managers/V2/POST/PostOrder";
import { DependencyContext } from "@/UI/Dependency";
import { words } from "@/UI/words";
import { ToastAlert } from "../../ToastAlert";
import { CanvasContext, InstanceComposerContext } from "../Context/Context";
import { getServiceOrderItems } from "../helpers";

/**
 * Properties for the Toolbar component.
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
 * Toolbar component
 *
 * This component represents the toolbar of the Composer.
 * It contains controls to cancel creating or editing instance or sending serviceOrderItems to the backend.
 * Also, it shows feedback notification to the user.
 *
 * @props {Props} props - The properties passed to the component.
 * @prop {string} props.serviceName - The name of the service.
 * @prop {boolean} props.editable - A flag indicating if the diagram is editable.
 * @prop {DiagramHandlers | null} props.diagramHandlers - The handlers for various diagram actions.
 *
 * @returns {React.FC} The Toolbar component.
 */
export const Toolbar: React.FC<Props> = ({ serviceName, editable }) => {
  const { serviceModels, mainService, instance } = useContext(
    InstanceComposerContext,
  );
  const { serviceOrderItems, isDirty, looseEmbedded, diagramHandlers } =
    useContext(CanvasContext);
  const { routeManager, environmentHandler } = useContext(DependencyContext);

  const [alertMessage, setAlertMessage] = useState("");
  const [alertType, setAlertType] = useState(AlertVariant.danger);

  const environment = environmentHandler.useId();

  const metadataMutation = usePostMetadata(environment);
  const oderMutation = usePostOrder(environment);

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
    const coordinates = diagramHandlers?.getCoordinates();

    const serviceOrderItems = getServiceOrderItems(
      serviceOrderItems,
      serviceModels,
    )
      .filter((item) => item.action !== null)
      .map((instance) => ({
        ...instance,
        metadata: {
          coordinates: JSON.stringify(coordinates),
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
          value: JSON.stringify(coordinates),
        },
      });
    }

    oderMutation.mutate(serviceOrderItems);
  };

  useEffect(() => {
    if (oderMutation.isSuccess) {
      //If response is successful then show feedback notification and redirect user to the service inventory view
      setAlertType(AlertVariant.success);
      setAlertMessage(words("instanceComposer.success"));

      setTimeout(() => {
        navigate(url);
      }, 1000);
    } else if (oderMutation.isError) {
      setAlertType(AlertVariant.danger);
      setAlertMessage(oderMutation.error.message);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [oderMutation.isSuccess, oderMutation.isError]);

  return (
    <Container
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
          <StyledButton variant="tertiary" width={200} onClick={handleRedirect}>
            {words("cancel")}
          </StyledButton>
          <StyledButton
            variant="primary"
            width={200}
            onClick={handleDeploy}
            isDisabled={
              serviceOrderItems.size < 1 ||
              !isDirty ||
              looseEmbedded.size > 0 ||
              !editable
            }
          >
            {words("deploy")}
          </StyledButton>
        </Flex>
      </FlexItem>
    </Container>
  );
};

const Container = styled(Flex)`
  padding: 0 0 20px;
`;

const StyledButton = styled(Button)`
  --pf-v5-c-button--PaddingTop: 3px;
  --pf-v5-c-button--PaddingBottom: 3px;
  width: 101px;
  height: 36px;
`;

import React, { useCallback, useContext, useEffect, useState } from "react";
import "@inmanta/rappid/joint-plus.css";
import { useNavigate } from "react-router-dom";
import { AlertVariant, Button, Flex, FlexItem } from "@patternfly/react-core";
import styled from "styled-components";
import { usePostMetadata } from "@/Data/Managers/V2/PostMetadata";
import { usePostOrder } from "@/Data/Managers/V2/PostOrder";
import { DependencyContext } from "@/UI/Dependency";
import { words } from "@/UI/words";
import { ToastAlert } from "../../ToastAlert";
import { CanvasContext, InstanceComposerContext } from "../Context/Context";
import { getServiceOrderItems } from "../helpers";
import { DiagramHandlers } from "../init";

const Toolbar = ({
  serviceName,
  editable,
  diagramHandlers,
}: {
  serviceName: string;
  editable: boolean;
  diagramHandlers: DiagramHandlers | null;
}) => {
  const { serviceModels, mainService, instance } = useContext(
    InstanceComposerContext,
  );
  const { instancesToSend, isDirty, looseEmbedded } = useContext(CanvasContext);
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
      instancesToSend,
      serviceModels,
    )
      .filter((item) => item.action !== null)
      .map((instance) => ({
        ...instance,
        metadata: {
          coordinates: JSON.stringify(coordinates),
        },
      }));

    //Temporary workaround to update coordinates in metadata, as currently order endpoint don't handle metadata in the updates.
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
      setAlertMessage(words("inventory.instanceComposer.success"));

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
              ? words("inventory.instanceComposer.success.title")
              : words("inventory.instanceComposer.failed.title")
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
              instancesToSend.size < 1 ||
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
export default Toolbar;

const Container = styled(Flex)`
  padding: 0 0 20px;
`;

const StyledButton = styled(Button)`
  --pf-v5-c-button--PaddingTop: 3px;
  --pf-v5-c-button--PaddingBottom: 3px;
  width: 101px;
  height: 36px;
`;

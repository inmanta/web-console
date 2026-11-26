import React from "react";
import { FlexItem, Flex } from "@patternfly/react-core";
import { words } from "@inmanta/web-console-core";
import { useGetServiceModels } from "@inmanta/web-console-core/Queries/Slices/Service";
import { ErrorView } from "@inmanta/web-console-ui/Components/ErrorView";
import { LoadingView } from "@inmanta/web-console-ui/Components/LoadingView";
import { PageContainer } from "@inmanta/web-console-ui/Components/PageContainer";
import { Composer } from "../Composer";
import {
  ComposerContainer,
  ComposerActions,
  Canvas,
  LeftSidebar,
  RightSidebar,
  ZoomControls,
} from "../UI";

/**
 * Props interface for the ComposerCreatorProvider component
 *
 * This interface represents the properties that the ComposerCreatorProvider component expects to receive.
 *
 * @interface
 * @property {string} serviceName - The name of the service to create an instance of.
 */
interface Props {
  serviceName: string;
}

/**
 * ComposerCreatorProvider component
 *
 * This component is responsible for providing the service model related data to the Composer component.
 * It fetches the service models for the entire catalog; the Composer fetches the inventory.
 *
 * @props {Props} props - The properties that define the behavior and display of the component.
 * @prop {string} serviceName - The name of the service to create an instance of.
 *
 * @returns {React.FC<Props>} The ComposerCreatorProvider component.
 */
export const ComposerCreatorProvider: React.FC<Props> = ({ serviceName }) => {
  const serviceModels = useGetServiceModels().useOneTime();

  if (serviceModels.isError) {
    const message = words("error.general")(serviceModels.error.message);
    const retry = serviceModels.refetch;
    const ariaLabel = "ComposerCreatorProvider-ServiceModelsQuery_failed";

    return <ErrorView message={message} ariaLabel={ariaLabel} retry={retry} />;
  }

  if (serviceModels.isSuccess) {
    const mainService = serviceModels.data.find((service) => service.name === serviceName);

    if (!mainService) {
      const message = words("instanceComposer.noServiceModel.errorMessage")(serviceName);
      const retry = serviceModels.refetch;
      const ariaLabel = "ComposerCreatorProvider-NoServiceModel_failed";

      return <ErrorView message={message} ariaLabel={ariaLabel} retry={retry} />;
    }

    return (
      <Composer editable serviceName={serviceName}>
        <PageContainer
          pageTitle={
            <Flex justifyContent={{ default: "justifyContentSpaceBetween" }}>
              <FlexItem> {words("instanceComposer.title")}</FlexItem>
              <FlexItem>
                <ComposerActions serviceName={serviceName} editable />
              </FlexItem>
            </Flex>
          }
        >
          <ComposerContainer id="canvas-wrapper">
            <LeftSidebar />
            <Canvas />
            <RightSidebar />
            <ZoomControls />
          </ComposerContainer>
        </PageContainer>
      </Composer>
    );
  }

  return <LoadingView ariaLabel="ComposerCreatorProvider-Loading" />;
};

import React, { useContext } from "react";
import { Flex, FlexItem } from "@patternfly/react-core";
import { words } from "@inmanta/web-console-core";
import { DependencyContext } from "@inmanta/web-console-core/Dependency";
import { useGetServiceModels } from "@inmanta/web-console-core/Queries/Slices/Service";
import { useGetInstanceWithRelations } from "@inmanta/web-console-core/Queries/Slices/ServiceInstance";
import { EmptyView } from "@inmanta/web-console-ui/Components/EmptyView";
import { ErrorView } from "@inmanta/web-console-ui/Components/ErrorView";
import { LoadingView } from "@inmanta/web-console-ui/Components/LoadingView";
import { PageContainer } from "@inmanta/web-console-ui/Components/PageContainer";
import { Composer } from "./Composer";
import {
  Canvas,
  ComposerActions,
  ComposerContainer,
  LeftSidebar,
  RightSidebar,
  ZoomControls,
} from "./UI";

interface Props {
  serviceName: string;

  /** The instance to edit or view; none to create a new one. */
  instanceId?: string;
  editable: boolean;
}

/**
 * The page of the Instance Composer, for its three routes: create an instance of a service, edit
 * one, or view one. Without the composer licence it says the composer isn't enabled.
 */
export const ComposerPage: React.FC<Props> = (props) => {
  const { orchestratorProvider } = useContext(DependencyContext);

  if (!orchestratorProvider.isComposerEnabled()) {
    return (
      <EmptyView message={words("instanceComposer.disabled")} aria-label="ComposerPage-Disabled" />
    );
  }

  return <ComposerPageContent {...props} />;
};

/**
 * Loads the service catalog and, to edit or view, the instance with its related instances, once,
 * and hands them to the Composer.
 */
const ComposerPageContent: React.FC<Props> = ({ serviceName, instanceId, editable }) => {
  const serviceModelsQuery = useGetServiceModels().useOneTime();
  const mainService = serviceModelsQuery.data?.find((service) => service.name === serviceName);

  // The viewer also shows the instances that refer to this one; the editor doesn't, like the
  // instance form. The query only runs with an instance id and the service.
  const instanceQuery = useGetInstanceWithRelations(
    instanceId ?? "",
    !editable,
    mainService
  ).useOneTime();

  if (serviceModelsQuery.isError) {
    return (
      <ErrorView
        message={words("error.general")(serviceModelsQuery.error.message)}
        ariaLabel="ComposerPage-ServiceModelsQuery_failed"
        retry={serviceModelsQuery.refetch}
      />
    );
  }

  if (serviceModelsQuery.isSuccess && !mainService) {
    return (
      <ErrorView
        message={words("instanceComposer.noServiceModel.errorMessage")(serviceName)}
        ariaLabel="ComposerPage-NoServiceModel_failed"
        retry={serviceModelsQuery.refetch}
      />
    );
  }

  if (instanceId && instanceQuery.isError) {
    return (
      <ErrorView
        message={words("error.general")(instanceQuery.error.message)}
        ariaLabel="ComposerPage-InstanceQuery_failed"
        retry={instanceQuery.refetch}
      />
    );
  }

  if (!serviceModelsQuery.isSuccess || !mainService || (instanceId && !instanceQuery.isSuccess)) {
    return <LoadingView ariaLabel="ComposerPage-Loading" />;
  }

  const title = !instanceId
    ? words("instanceComposer.title")
    : words(editable ? "instanceComposer.title.edit" : "instanceComposer.title.view");

  return (
    <Composer
      editable={editable}
      serviceCatalog={serviceModelsQuery.data}
      mainService={mainService}
      instance={instanceId ? instanceQuery.data : undefined}
    >
      <PageContainer
        pageTitle={
          <Flex justifyContent={{ default: "justifyContentSpaceBetween" }}>
            <FlexItem>{title}</FlexItem>
            <FlexItem>
              <ComposerActions serviceName={serviceName} editable={editable} />
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
};

import { RemoteData } from "@/Core";
import { ErrorView, LoadingView } from "@/UI/Components";
import { DependencyContext } from "@/UI/Dependency";
import { MomentDatePresenter } from "@/UI/Utils";
import { words } from "@/UI/words";
import { Button } from "@patternfly/react-core";
import { ExternalLinkAltIcon } from "@patternfly/react-icons";
import React, { useContext } from "react";
import { ResourceDetailsContent } from "./ResourceDetailsContent";

interface Props {
  id: string;
}

export const DetailsTab: React.FC<Props> = ({ id }) => {
  const { queryResolver, urlManager } = useContext(DependencyContext);

  const [data] = queryResolver.useContinuous<"ResourceDetails">({
    kind: "ResourceDetails",
    id,
  });
  const datePresenter = new MomentDatePresenter();

  return RemoteData.fold(
    {
      notAsked: () => null,
      loading: () => (
        <ResourceContentWrapper aria-label="ResourceDetails-Loading">
          <LoadingView delay={500} />
        </ResourceContentWrapper>
      ),
      failed: (error) => (
        <ResourceContentWrapper aria-label="ResourceDetails-Failed">
          <ErrorView
            title={words("resources.details.failed.title")}
            message={words("resources.details.failed.body")(error)}
          />
        </ResourceContentWrapper>
      ),
      success: (resourceDetails) => (
        <ResourceDetailsContent
          id={resourceDetails.resource_id}
          lastDeploy={
            resourceDetails.last_deploy
              ? datePresenter.getFull(resourceDetails.last_deploy)
              : ""
          }
          firstGeneratedTime={datePresenter.getFull(
            resourceDetails.first_generated_time
          )}
          versionLink={
            <Button
              component="a"
              variant="link"
              isInline={true}
              icon={<ExternalLinkAltIcon />}
              href={urlManager.getModelVersionUrl(
                resourceDetails.first_generated_version.toString()
              )}
              target="_blank"
            >
              {words("resources.details.versionLink")}
            </Button>
          }
          aria-label="ResourceTable-Success"
        />
      ),
    },
    data
  );
};

const ResourceContentWrapper: React.FC<{
  "aria-label"?: string;
}> = ({ children, ...props }) => {
  return <div aria-label={props["aria-label"]}>{children}</div>;
};

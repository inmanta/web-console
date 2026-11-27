import React from "react";
import { Content, Flex, FlexItem, Icon, PageSection } from "@patternfly/react-core";
import { ArrowRightIcon } from "@patternfly/react-icons";
import { Diff, words } from "@inmanta/web-console-core";
import {
  LOADING_INDICATOR_TIMING,
  useIsLoadingIndicatorShown,
} from "@inmanta/web-console-core/Common";
import { useGetDesiredStateDiff } from "@inmanta/web-console-core/Queries/Slices/DesiredState";
import { useNavigateTo, useRouteParams } from "@inmanta/web-console-core/Routing";
import * as DiffWizard from "@inmanta/web-console-feature-orchestration-engine/Components/DiffWizard";
import { EmptyView } from "@inmanta/web-console-ui/Components/EmptyView";
import { ErrorView } from "@inmanta/web-console-ui/Components/ErrorView";
import { CompareModelVersionSelect } from "./CompareModelVersionSelect";

export const Page: React.FC = () => {
  const { from, to } = useRouteParams<"DesiredStateCompare">();

  return <View from={from} to={to} />;
};

/**
 * The diff between two model versions: a header with a select for each model version, the
 * filters, and the resources in a list with the diff of the selected one next to it. Selecting a
 * model version opens its diff and keeps the filters and the selected resource in the URL. The
 * selects only offer model versions that keep the diff going from the older model version to the
 * newer one. While the diff of the selected model versions loads, the previous diff stays; a load
 * that takes a while shows loading placeholders in the list and diff pane instead.
 *
 * @props {Diff.Identifiers} props - The component props
 *  @prop {string} from - The model version the diff starts from
 *  @prop {string} to - The model version the diff goes to
 *
 * @returns {React.FC<Diff.Identifiers>} The compare view
 */
const View: React.FC<Diff.Identifiers> = ({ from, to }) => {
  const navigateTo = useNavigateTo();
  const { data, isError, error, isLoading, isPlaceholderData, refetch } =
    useGetDesiredStateDiff().useOneTime(from, to);
  const isSkeletonShown = useIsLoadingIndicatorShown(
    isLoading || isPlaceholderData,
    LOADING_INDICATOR_TIMING
  );

  const renderDiff = () => {
    if (isError) {
      return <ErrorView ariaLabel="CompareView-Error" retry={refetch} message={error.message} />;
    }
    if (isSkeletonShown) {
      return (
        <DiffWizard.FilteredResourceListWithDiffPane
          resources={undefined}
          route="DesiredStateCompare"
          fromLabel={words("modelVersion")(from)}
          toLabel={words("modelVersion")(to)}
        />
      );
    }
    if (data === undefined) {
      return null;
    }
    if (data.resources.length <= 0) {
      return (
        <EmptyView message={words("desiredState.compare.empty")} aria-label="CompareView-Empty" />
      );
    }

    // The diff on screen can still be the previous one, so its own model versions name the columns.
    return (
      <DiffWizard.FilteredResourceListWithDiffPane
        resources={data.resources}
        route="DesiredStateCompare"
        fromLabel={words("modelVersion")(data.from)}
        toLabel={words("modelVersion")(data.to)}
      />
    );
  };

  return (
    <>
      <PageSection>
        <Flex gap={{ default: "gapMd" }} alignItems={{ default: "alignItemsCenter" }}>
          {/* Wrapped, so the heading has no bottom margin and centers with the selects. */}
          <FlexItem>
            <Content component="h1">{words("desiredState.compare.title")}</Content>
          </FlexItem>
          <Flex gap={{ default: "gapSm" }} alignItems={{ default: "alignItemsCenter" }}>
            <FlexItem>
              <CompareModelVersionSelect
                id="compare-from-model-version"
                label={words("desiredState.compare.fromModelVersion")}
                modelVersion={Number(from)}
                isModelVersionDisabled={(modelVersion) => modelVersion >= Number(to)}
                onSelect={(modelVersion) =>
                  navigateTo("DesiredStateCompare", { from: String(modelVersion), to })
                }
              />
            </FlexItem>
            <Icon>
              <ArrowRightIcon title={words("desiredState.compare.versionSeparator")} />
            </Icon>
            <FlexItem>
              <CompareModelVersionSelect
                id="compare-to-model-version"
                label={words("desiredState.compare.toModelVersion")}
                modelVersion={Number(to)}
                isModelVersionDisabled={(modelVersion) => modelVersion <= Number(from)}
                onSelect={(modelVersion) =>
                  navigateTo("DesiredStateCompare", { from, to: String(modelVersion) })
                }
              />
            </FlexItem>
          </Flex>
        </Flex>
      </PageSection>
      <DiffWizard.ScrollingPageSection>{renderDiff()}</DiffWizard.ScrollingPageSection>
    </>
  );
};

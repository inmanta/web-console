import React from "react";
import { Content, Flex, FlexItem, Icon, Label, PageSection } from "@patternfly/react-core";
import { ArrowRightIcon } from "@patternfly/react-icons";
import { Diff, words } from "@inmanta/web-console-core";
import { useGetDesiredStateDiff } from "@inmanta/web-console-core/Queries/Slices/DesiredState";
import { useRouteParams } from "@inmanta/web-console-core/Routing";
import * as DiffWizard from "@inmanta/web-console-feature-orchestration-engine/Components/DiffWizard";
import { EmptyView } from "@inmanta/web-console-ui/Components/EmptyView";
import { ErrorView } from "@inmanta/web-console-ui/Components/ErrorView";
import { LoadingView } from "@inmanta/web-console-ui/Components/LoadingView";

export const Page: React.FC = () => {
  const { from, to } = useRouteParams<"DesiredStateCompare">();

  return <View from={from} to={to} />;
};

/**
 * The diff between two model versions: a header with both versions, the filters, and the
 * resources in a list with the diff of the selected one next to it.
 *
 * @props {Diff.Identifiers} props - The component props
 *  @prop {string} from - The model version the diff starts from
 *  @prop {string} to - The model version the diff goes to
 *
 * @returns {React.FC<Diff.Identifiers>} The compare view
 */
export const View: React.FC<Diff.Identifiers> = ({ from, to }) => {
  const { data, isError, error, isSuccess, refetch } = useGetDesiredStateDiff().useOneTime(
    from,
    to
  );

  if (isError) {
    return <ErrorView ariaLabel="CompareView-Error" retry={refetch} message={error.message} />;
  }

  if (!isSuccess) {
    return <LoadingView ariaLabel="CompareView-Loading" />;
  }

  return (
    <>
      <PageSection>
        <Flex gap={{ default: "gapMd" }} alignItems={{ default: "alignItemsCenter" }}>
          {/* Wrapped, so the heading has no bottom margin and centers with the labels. */}
          <FlexItem>
            <Content component="h1">{words("desiredState.compare.title")}</Content>
          </FlexItem>
          <Flex gap={{ default: "gapSm" }} alignItems={{ default: "alignItemsCenter" }}>
            <Label variant="outline">{words("modelVersion")(from)}</Label>
            <Icon>
              <ArrowRightIcon title={words("desiredState.compare.versionSeparator")} />
            </Icon>
            <Label variant="outline">{words("modelVersion")(to)}</Label>
          </Flex>
        </Flex>
      </PageSection>
      <DiffWizard.ScrollingPageSection>
        {data.length <= 0 ? (
          <EmptyView message={words("desiredState.compare.empty")} aria-label="CompareView-Empty" />
        ) : (
          <DiffWizard.FilteredResourceListWithDiffPane
            resources={data}
            route="DesiredStateCompare"
            fromLabel={words("modelVersion")(from)}
            toLabel={words("modelVersion")(to)}
          />
        )}
      </DiffWizard.ScrollingPageSection>
    </>
  );
};

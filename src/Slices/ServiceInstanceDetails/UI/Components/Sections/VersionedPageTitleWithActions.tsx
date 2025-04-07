import React, { useContext } from "react";
import { Flex, FlexItem, Label } from "@patternfly/react-core";
import { useUrlStateWithString } from "@/Data";
import { words } from "@/UI";
import { InstanceDetailsContext } from "../../../Core/Context";
import { InstanceActions } from "../InstanceActions";

interface Props {
  title: string;
}

/**
 * The PageTitleWithVersion Component
 *
 * When the version is the latest active version, we don't display a tag.
 * When the version is not the latest active version, we display a tag with the version number.
 * If the instance is deleted, we display a label with the terminated-state.
 *
 * The title section also contains InstanceActions
 *
 * @note This component requires the ServiceInstanceDetails context to exist in one of its parents.
 *
 * @Props {Props} - The props of the component.
 *  @prop {string} title - the title of the page.
 *
 * @returns {React.FC<Props>} A React Component that displays the page title with the correct version tag
 */
export const VersionedPageTitleWithActions: React.FC<Props> = ({ title }) => {
  const { instance } = useContext(InstanceDetailsContext);

  const [selectedVersion] = useUrlStateWithString<string>({
    default: String(instance.version),
    key: "version",
    route: "InstanceDetails",
  });

  const isLatest = selectedVersion === String(instance.version);

  return (
    <Flex justifyContent={{ default: "justifyContentSpaceBetween" }}>
      <Flex alignItems={{ default: "alignItemsCenter" }} gap={{ default: "gapSm" }}>
        {title}
        {!isLatest && [
          <Label data-testid="selected-version" key="selected-version" color="purple">
            {words("instanceDetails.title.tag")(selectedVersion)}
          </Label>,
        ]}
        {instance.deleted && (
          <Label status="danger" data-testid="terminated" key="terminated">
            {instance.state}
          </Label>
        )}
      </Flex>
      <FlexItem>{isLatest && <InstanceActions />}</FlexItem>
    </Flex>
  );
};

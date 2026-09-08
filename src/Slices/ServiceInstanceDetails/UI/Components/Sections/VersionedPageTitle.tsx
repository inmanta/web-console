import React, { useContext } from "react";
import { Flex, Label } from "@patternfly/react-core";
import { useUrlStateWithString } from "@/Data";
import { words } from "@/UI";
import { InstanceDetailsContext } from "../../../Core/Context";

interface Props {
  title: string;
}

/**
 * The Service Instance Details page title: the title text, plus a version tag on a non-latest
 * version and a terminated-state label when the instance is deleted. Requires the
 * ServiceInstanceDetails context; the header actions live in {@link InstanceHeaderActions}.
 */
export const VersionedPageTitle: React.FC<Props> = ({ title }) => {
  const { instance } = useContext(InstanceDetailsContext);

  const [selectedVersion] = useUrlStateWithString<string>({
    default: String(instance.version),
    key: "version",
    route: "InstanceDetails",
  });

  const isLatest = selectedVersion === String(instance.version);

  return (
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
  );
};

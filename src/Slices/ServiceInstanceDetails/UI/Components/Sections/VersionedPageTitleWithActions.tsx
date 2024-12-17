import React, { useContext } from "react";
import { Label } from "@patternfly/react-core";
import { InfoAltIcon } from "@patternfly/react-icons";
import styled from "styled-components";
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
 * When the version is the latest active version,
 * an additional tag is displayed to inform the user they are visualizing the latest version.
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
    key: `version`,
    route: "InstanceDetails",
  });

  const isLatest = selectedVersion === String(instance.version);

  return (
    <>
      {title}
      <LabelContainer>
        <Label data-testid="selected-version">
          {words("instanceDetails.title.tag")(selectedVersion)}
        </Label>
        {isLatest && (
          <Label color="green" icon={<InfoAltIcon />}>
            {words("instanceDetails.title.latest")}
          </Label>
        )}
        {instance.deleted && (
          <Label color="red" icon={<InfoAltIcon />}>
            {instance.state}
          </Label>
        )}
      </LabelContainer>
      {isLatest && <InstanceActions />}
    </>
  );
};

const LabelContainer = styled.span`
  margin-left: var(--pf-t--global--spacer--md);
  display: inline-flex;
  gap: var(--pf-t--global--spacer--sm);
`;

import React, { useContext, useState } from "react";
import {
  Card,
  CardBody,
  CardExpandableContent,
  CardHeader,
  Title,
  DescriptionList,
  DescriptionListDescription,
  DescriptionListGroup,
  DescriptionListTerm,
  Panel,
} from "@patternfly/react-core";
import { words } from "@/UI";
import { DateWithTooltip, TextWithCopy } from "@/UI/Components";
import { InstanceDetailsContext } from "../../../Core/Context";

/**
 * The DetailsSection Component
 *
 * Displays a collapsible section containing the details of the instance.
 *
 * @note This component requires the ServiceInstanceDetails context to exist in one of its parents.
 *
 * @returns {React.FC} A React Component displaying the DetailsSection
 */
export const DetailsSection: React.FC = () => {
  const { instance } = useContext(InstanceDetailsContext);

  const [isExpanded, setIsExpanded] = useState(true);

  const onExpand = (_event: React.MouseEvent, _id: string) => {
    setIsExpanded(!isExpanded);
  };

  return (
    <Panel variant="raised">
      <Card id="details-expandable-card" isExpanded={isExpanded} isPlain>
        <CardHeader
          onExpand={onExpand}
          isToggleRightAligned
          toggleButtonProps={{
            id: "toggle-button-details",
            "aria-label": "Details",
            "aria-labelledby": "details-expandable-card toggle-button",
            "aria-expanded": isExpanded,
          }}
        >
          <Title headingLevel="h2">
            {words("instanceDetails.details.title")}
          </Title>
        </CardHeader>
        <CardExpandableContent>
          <CardBody>
            <DescriptionList isHorizontal isCompact isFluid>
              <DescriptionListGroup>
                <DescriptionListTerm>Id: </DescriptionListTerm>
                <DescriptionListDescription>
                  <TextWithCopy
                    value={instance.id}
                    tooltipContent={words("id.copy")}
                  />
                </DescriptionListDescription>
              </DescriptionListGroup>
              <DescriptionListGroup>
                <DescriptionListTerm>
                  {words("instanceDetails.details.created")}
                </DescriptionListTerm>
                <DescriptionListDescription>
                  <DateWithTooltip timestamp={instance.created_at} />
                </DescriptionListDescription>
              </DescriptionListGroup>
              <DescriptionListGroup>
                <DescriptionListTerm>
                  {words("instanceDetails.details.updated")}
                </DescriptionListTerm>
                <DescriptionListDescription>
                  <DateWithTooltip timestamp={instance.last_updated} />
                </DescriptionListDescription>
              </DescriptionListGroup>
            </DescriptionList>
          </CardBody>
        </CardExpandableContent>
      </Card>
    </Panel>
  );
};

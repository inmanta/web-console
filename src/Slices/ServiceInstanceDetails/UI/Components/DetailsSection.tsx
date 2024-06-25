import React, { useContext, useState } from "react";
import {
  Card,
  CardBody,
  CardExpandableContent,
  CardHeader,
  CardTitle,
  DescriptionList,
  DescriptionListDescription,
  DescriptionListGroup,
  DescriptionListTerm,
  Panel,
} from "@patternfly/react-core";
import { DateWithTooltip, TextWithCopy } from "@/UI/Components";
import { InstanceContext } from "../../Core/Context";

export const DetailsSection: React.FunctionComponent = () => {
  const { instance } = useContext(InstanceContext);

  const [isExpanded, setIsExpanded] = useState(true);

  const onExpand = (_event: React.MouseEvent, _id: string) => {
    setIsExpanded(!isExpanded);
  };

  return (
    <Panel variant="raised">
      <Card id="details-expandable-card" isExpanded={isExpanded} isPlain>
        <CardHeader onExpand={onExpand}>
          <CardTitle id="details-card-title">Details</CardTitle>
        </CardHeader>
        <CardExpandableContent>
          <CardBody>
            <DescriptionList isHorizontal isCompact isFluid>
              <DescriptionListGroup>
                <DescriptionListTerm>Id: </DescriptionListTerm>
                <DescriptionListDescription>
                  <TextWithCopy value={instance.id} tooltipContent="Copy ID" />
                </DescriptionListDescription>
              </DescriptionListGroup>
              <DescriptionListGroup>
                <DescriptionListTerm>Created: </DescriptionListTerm>
                <DescriptionListDescription>
                  <DateWithTooltip timestamp={instance.created_at} />
                </DescriptionListDescription>
              </DescriptionListGroup>
              <DescriptionListGroup>
                <DescriptionListTerm>Updated: </DescriptionListTerm>
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

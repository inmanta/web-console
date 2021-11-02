import React from "react";
import styled from "styled-components";
import {
  ListItem,
  DescriptionList,
  DescriptionListTerm,
  DescriptionListGroup,
  DescriptionListDescription,
  Title,
  Flex,
  FlexItem,
} from "@patternfly/react-core";

interface Props {
  name: string;
  details: [string, string][];
  icon: React.ReactNode;
  category?: string;
}

export const StatusItem: React.FC<Props> = ({
  name,
  details,
  icon,
  category,
}) => (
  <ListItem icon={icon}>
    <Flex direction={{ default: "column" }}>
      <FlexItem>
        <InlineTitle headingLevel="h3">{name}</InlineTitle>
        <span>{category}</span>
      </FlexItem>
      {details.length > 0 && (
        <FlexItem>
          <CompactDescriptionList isHorizontal isCompact>
            {details.map(([key, value]) => (
              <DescriptionListGroup key={key}>
                <DescriptionListTerm>{key}</DescriptionListTerm>
                <DescriptionListDescription>{value}</DescriptionListDescription>
              </DescriptionListGroup>
            ))}
          </CompactDescriptionList>
        </FlexItem>
      )}
    </Flex>
  </ListItem>
);

const InlineTitle = styled(Title)`
  display: inline-block;
  padding-right: 8px;
`;

const CompactDescriptionList = styled(DescriptionList)`
  --pf-c-description-list--m-compact--RowGap: 0;
  margin-bottom: 16px;
`;

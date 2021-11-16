import React from "react";
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
import styled from "styled-components";

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
  <ListItem icon={icon} aria-label={`StatusItem-${name}`}>
    <Flex direction={{ default: "column" }}>
      <FlexItem>
        <InlineTitle headingLevel="h3">{name}</InlineTitle>
        <Category>{category}</Category>
      </FlexItem>
      {details.length > 0 && (
        <FlexItem>
          <CompactDescriptionList isHorizontal isCompact isFluid>
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

const Category = styled.span`
  color: var(--pf-global--palette--black-500);
`;

const InlineTitle = styled(Title)`
  display: inline-block;
  padding-right: 8px;
`;

const CompactDescriptionList = styled(DescriptionList)`
  --pf-c-description-list--m-compact--RowGap: 0;
  margin-bottom: 16px;
`;

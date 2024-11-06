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
import { DetailTuple } from "./StatusList";

interface Props {
  name: string;
  details: DetailTuple[];
  icon: React.ReactNode;
  category?: string;
}

/**
 * Renders a status item
 *
 * @props {Props} props - The properties for the status item component.
 * @prop {string} name - The name of the status item.
 * @prop {DetailTuple[]} details - The details of the status item, which can include nested objects.
 * @prop {React.ReactNode} icon - The icon to display for the status item.
 * @prop {string} [category] - The category of the status item.
 * @returns {React.FC<Props>} The rendered status item component.
 */
export const StatusItem: React.FC<Props> = ({
  name,
  details,
  icon,
  category,
}) => (
  <ListItem icon={icon} aria-label={`StatusItem-${name}`}>
    <Flex direction={{ default: "column" }}>
      <FlexItem>
        <InlineTitle headingLevel="h2">{name}</InlineTitle>
        <Category>{category}</Category>
      </FlexItem>
      {details.length > 0 && (
        <FlexItem>
          <CompactDescriptionList isHorizontal isCompact isFluid>
            {details.map(([key, value]) => {
              if (typeof value === "object") {
                return <SubList key={key} name={key} properties={value} />;
              } else {
                return (
                  <DescriptionListGroup key={key}>
                    <DescriptionListTerm>{key}</DescriptionListTerm>
                    <DescriptionListDescription>
                      {value}
                    </DescriptionListDescription>
                  </DescriptionListGroup>
                );
              }
            })}
          </CompactDescriptionList>
        </FlexItem>
      )}
    </Flex>
  </ListItem>
);

const Category = styled.span`
  color: var(--pf-v5-global--palette--black-500);
`;

const InlineTitle = styled(Title)`
  display: inline-block;
  padding-right: var(--pf-v5-global--spacer--sm);
`;

const CompactDescriptionList = styled(DescriptionList)`
  --pf-v5-c-description-list--m-compact--RowGap: 0;
  margin-bottom: var(--pf-v5-global--spacer--md);
`;

const IndentedDescriptionListGroup = styled(DescriptionListGroup)`
  padding-left: var(--pf-v5-global--spacer--md);
`;

interface SubListProps {
  name: string;
  properties: Record<string, string>;
}

/**
 * Renders sub list for Status value that is a Record instead of string.
 *
 * @props {SubListProps} props - The properties for the SubList component.
 * @prop {string} name - The name of the property.
 * @prop {Record<string, string>} properties - The sub properties to display in the SubList components.
 * @returns {React.FC<SubListProps>} The rendered SubList component.
 */
const SubList: React.FC<SubListProps> = ({ name, properties }) => {
  return (
    <ListItem aria-label={`StatusSubList-${name}`}>
      <DescriptionListGroup>
        <DescriptionListTerm>{name}</DescriptionListTerm>
      </DescriptionListGroup>
      {Object.entries(properties).map(([subKey, subValue]) => (
        <IndentedDescriptionListGroup key={name + "_" + subKey}>
          <DescriptionListTerm>{subKey}</DescriptionListTerm>
          <DescriptionListDescription>{subValue}</DescriptionListDescription>
        </IndentedDescriptionListGroup>
      ))}
    </ListItem>
  );
};

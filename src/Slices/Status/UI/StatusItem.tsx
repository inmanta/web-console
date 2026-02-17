import React from "react";
import {
  ListItem,
  DescriptionList,
  DescriptionListTerm,
  DescriptionListGroup,
  DescriptionListDescription,
  Title,
  Label,
  DataListItem,
  DataListItemRow,
  DataListItemCells,
  DataListCell,
  List,
  FlexItem,
  Flex,
} from "@patternfly/react-core";
import { t_global_font_size_200 } from "@patternfly/react-tokens";
import { v4 as uuidv4 } from "uuid";
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
export const StatusItem: React.FC<Props> = ({ name, details, icon, category }) => (
  <DataListItem aria-label={`StatusItem-${name}`}>
    <DataListItemRow key={`${category ?? "status"}-${name}-title-${uuidv4()}`}>
      <DataListItemCells
        dataListCells={[
          <DataListCell key={`${category ?? "status"}-${name}-title-${uuidv4()}`}>
            <Flex alignItems={{ default: "alignItemsCenter" }}>
              <FlexItem>
                <Title headingLevel="h2">
                  {icon} {name}
                </Title>
              </FlexItem>
              {category && (
                <FlexItem>
                  <Label variant="outline">{category}</Label>
                </FlexItem>
              )}
            </Flex>
          </DataListCell>,
        ]}
      />
    </DataListItemRow>
    <DataListItemRow key={`${category}-${name}-content`}>
      <DataListItemCells
        dataListCells={[
          <DataListCell key={`${category ?? "status"}-${name}-content`}>
            {details.length > 0 && (
              <List isPlain>
                {details.map(([key, value]) => {
                  if (typeof value === "object") {
                    return (
                      <NestedListItem key={`${uuidv4()}-${value}`} name={key} properties={value} />
                    );
                  } else {
                    return (
                      <ListItem key={`${uuidv4()}-${key}-${value}`}>
                        <DescriptionList
                          isHorizontal
                          horizontalTermWidthModifier={{
                            default: "25ch",
                          }}
                          isCompact
                        >
                          <DescriptionListGroup>
                            <DescriptionListTerm
                              style={{
                                fontSize: t_global_font_size_200.value,
                              }}
                            >
                              {key}
                            </DescriptionListTerm>
                            <DescriptionListDescription
                              style={{
                                fontSize: t_global_font_size_200.value,
                              }}
                            >
                              {value}
                            </DescriptionListDescription>
                          </DescriptionListGroup>
                        </DescriptionList>
                      </ListItem>
                    );
                  }
                })}
              </List>
            )}
          </DataListCell>,
        ]}
      />
    </DataListItemRow>
  </DataListItem>
);

interface NestedListItemProps {
  name: string;
  properties: Record<string, string>;
}

/**
 * Renders sub list for Status value that is a Record instead of string.
 *
 * @props {NestedListItemProps} props - The properties for the NestedListItem component.
 * @prop {string} name - The name of the property.
 * @prop {Record<string, string>} properties - The sub properties to display in the NestedListItem components.
 * @returns {React.FC<NestedListItemProps>} The rendered NestedListItem component.
 */
const NestedListItem: React.FC<NestedListItemProps> = ({ name, properties }) => {
  return (
    <List aria-label={`StatusNestedListItem-${name}`} isPlain>
      <ListItem>
        <b
          style={{
            fontSize: t_global_font_size_200.value,
          }}
        >
          {name}
        </b>
      </ListItem>
      <List key={`${name}-nested-list`} isPlain style={{ marginLeft: "1rem" }}>
        {Object.entries(properties).map(([subKey, subValue]) => (
          <ListItem key={name + "_" + subKey}>
            <DescriptionList
              isHorizontal
              isCompact
              horizontalTermWidthModifier={{
                default: "25ch",
              }}
            >
              <DescriptionListGroup>
                <DescriptionListTerm
                  style={{
                    fontSize: t_global_font_size_200.value,
                  }}
                >
                  {subKey}
                </DescriptionListTerm>
                <DescriptionListDescription
                  style={{
                    fontSize: t_global_font_size_200.value,
                  }}
                >
                  {subValue}
                </DescriptionListDescription>
              </DescriptionListGroup>
            </DescriptionList>
          </ListItem>
        ))}
      </List>
    </List>
  );
};

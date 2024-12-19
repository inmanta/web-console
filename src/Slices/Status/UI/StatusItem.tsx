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
} from "@patternfly/react-core";
import { uniqueId } from "lodash";
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
  <DataListItem aria-label={`StatusItem-${name}`}>
    <DataListItemRow key={`${category}-${name}-title`}>
      <DataListItemCells
        dataListCells={[
          <DataListCell key={uniqueId()}>
            <Title headingLevel="h2">
              {icon} {name}{" "}
              {category && <Label variant="outline">{category}</Label>}
            </Title>
          </DataListCell>,
        ]}
      />
    </DataListItemRow>
    <DataListItemRow key={`${category}-${name}-content`}>
      <DataListItemCells
        dataListCells={[
          <DataListCell key={uniqueId()}>
            {details.length > 0 && (
              <List isPlain>
                {details.map(([key, value]) => {
                  if (typeof value === "object") {
                    return (
                      <NestedListItem
                        key={`${key}-${value}`}
                        name={key}
                        properties={value}
                      />
                    );
                  } else {
                    return (
                      <ListItem key={`${key}-${value}`}>
                        <DescriptionList
                          isHorizontal
                          horizontalTermWidthModifier={{
                            default: "20ch",
                          }}
                        >
                          <DescriptionListGroup>
                            <DescriptionListTerm>{key}</DescriptionListTerm>
                            <DescriptionListDescription>
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
const NestedListItem: React.FC<NestedListItemProps> = ({
  name,
  properties,
}) => {
  return (
    <List aria-label={`StatusNestedListItem-${name}`} isPlain>
      <ListItem>
        <b>{name}</b>
      </ListItem>
      <List key={`${name}-nested-list`} isPlain={false}>
        {Object.entries(properties).map(([subKey, subValue]) => (
          <ListItem key={name + "_" + subKey}>
            <DescriptionList
              isHorizontal
              isCompact
              horizontalTermWidthModifier={{
                default: "20ch",
              }}
            >
              <DescriptionListGroup>
                <DescriptionListTerm>{subKey}</DescriptionListTerm>
                <DescriptionListDescription>
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

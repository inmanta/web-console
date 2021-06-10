import React, { useState } from "react";
import {
  Button,
  DataList,
  DataListItem,
  DataListItemRow,
  DataListToggle,
  DataListItemCells,
  DataListCell,
  DataListContent,
  DataListAction,
  Text,
  Title,
  TextVariants,
} from "@patternfly/react-core";
import { ServiceModel } from "@/Core";
import { CatalogTabs } from "./Tabs";
import { Link } from "react-router-dom";
import { Routing } from "@/UI/Routing";
import { SummaryIcons } from "./SummaryIcons";
import styled from "styled-components";
import { greyText } from "@/UI/Styles";
import { words } from "@/UI";
import { Spacer } from "@/UI/Components";

interface Props {
  services: ServiceModel[];
}

export const CatalogDataList: React.FunctionComponent<Props> = ({
  services,
}) => {
  const [expanded, setExpanded] = useState([""]);

  const Description = (descriptionProps) => {
    if (descriptionProps.service.description) {
      return (
        <div id={`${descriptionProps.service.name}-description`}>
          <Spacer />
          <StyledText component={TextVariants.small}>
            {descriptionProps.service.description}
          </StyledText>
          <Spacer />
        </div>
      );
    }
    return <div />;
  };
  const servicesById = services.reduce((acc, curr) => {
    acc[curr.name] = curr;
    return acc;
  }, {});

  const serviceItems = Object.keys(servicesById).map((serviceName) => {
    const service = servicesById[serviceName];
    const toggleId = serviceName + "-toggle";
    const serviceKey = serviceName + "-item";
    const expandKey = serviceName + "-expand";
    return (
      <DataListItem
        id={serviceName}
        key={serviceKey}
        aria-labelledby={serviceKey}
        isExpanded={expanded.includes(toggleId)}
      >
        <DataListItemRow>
          <DataListToggle
            onClick={() => onToggle(toggleId)}
            isExpanded={expanded.includes(toggleId)}
            id={toggleId}
            aria-controls={expandKey}
          />
          <DataListItemCells
            dataListCells={[
              <DataListCell key="primary content">
                <Title id={serviceKey} headingLevel="h2" size="xl">
                  {service.name}
                </Title>
                <Description service={service} />
                {service.instance_summary && (
                  <SummaryIcons summary={service.instance_summary} />
                )}
              </DataListCell>,
            ]}
          />
          <DataListAction
            aria-labelledby={service.name + "-action"}
            id={service.name + "-action"}
            aria-label="Actions"
          >
            <Link
              to={{
                pathname: Routing.getUrl("Inventory", {
                  service: service.name,
                }),
                search: location.search,
              }}
            >
              <Button>{words("catalog.button.inventory")}</Button>
            </Link>
          </DataListAction>
        </DataListItemRow>
        <DataListContent
          aria-label="Primary Content Details"
          id={expandKey}
          isHidden={!expanded.includes(toggleId)}
        >
          <CatalogTabs service={service} />
        </DataListContent>
      </DataListItem>
    );
  });

  const onToggle = (id) => {
    const index = expanded.indexOf(id);
    const newExpanded =
      index >= 0
        ? [
            ...expanded.slice(0, index),
            ...expanded.slice(index + 1, expanded.length),
          ]
        : [...expanded, id];
    setExpanded(newExpanded);
  };
  return (
    <DataList aria-label="List of service entities">{serviceItems}</DataList>
  );
};

const StyledText = styled(Text)`
  ${greyText};
`;

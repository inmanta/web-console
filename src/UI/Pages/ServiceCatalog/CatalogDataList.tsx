import React, { useContext } from "react";
import { Link } from "react-router-dom";
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
import styled from "styled-components";
import { ServiceModel } from "@/Core";
import { useUrlStateWithExpansion } from "@/Data";
import { Spacer } from "@/UI/Components";
import { DependencyContext } from "@/UI/Dependency";
import { greyText } from "@/UI/Styles";
import { words } from "@/UI/words";
import { SummaryIcons } from "./SummaryIcons";
import { CatalogTabs } from "./Tabs";

interface Props {
  services: ServiceModel[];
}

export const CatalogDataList: React.FunctionComponent<Props> = ({
  services,
}) => {
  const { routeManager } = useContext(DependencyContext);
  const [isExpanded, onExpansion] = useUrlStateWithExpansion({
    route: "Catalog",
  });

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

  const serviceItems = services.map((service) => {
    const serviceKey = service.name + "-item";
    const expandKey = service.name + "-expand";
    return (
      <DataListItem
        id={service.name}
        key={serviceKey}
        aria-labelledby={serviceKey}
        isExpanded={isExpanded(service.name)}
      >
        <DataListItemRow>
          <DataListToggle
            onClick={onExpansion(service.name)}
            isExpanded={isExpanded(service.name)}
            id={`${service.name}-toggle`}
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
                pathname: routeManager.getUrl("Inventory", {
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
          isHidden={!isExpanded(service.name)}
        >
          <CatalogTabs service={service} />
        </DataListContent>
      </DataListItem>
    );
  });

  return (
    <DataList aria-label="List of service entities">{serviceItems}</DataList>
  );
};

const StyledText = styled(Text)`
  ${greyText};
`;

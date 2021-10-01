import React from "react";
import { Link } from "react-router-dom";
import styled from "styled-components";
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
import { ServiceModel, toggleValueInList } from "@/Core";
import { getUrl } from "@/UI/Routing";
import { words } from "@/UI/words";
import { Spacer } from "@/UI/Components";
import { greyText } from "@/UI/Styles";
import { CatalogTabs } from "./Tabs";
import { SummaryIcons } from "./SummaryIcons";
import { useUrlState } from "@/Data";

interface Props {
  services: ServiceModel[];
}

export const CatalogDataList: React.FunctionComponent<Props> = ({
  services,
}) => {
  const [expanded, setExpanded] = useUrlState<string[]>({
    default: [],
    key: "expansion",
    route: "Catalog",
    validator: (v: unknown): v is string[] => Array.isArray(v),
  });

  const onToggle = (id: string) => setExpanded(toggleValueInList(id, expanded));

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
    const serviceKey = serviceName + "-item";
    const expandKey = serviceName + "-expand";
    return (
      <DataListItem
        id={serviceName}
        key={serviceKey}
        aria-labelledby={serviceKey}
        isExpanded={expanded.includes(serviceName)}
      >
        <DataListItemRow>
          <DataListToggle
            onClick={() => onToggle(serviceName)}
            isExpanded={expanded.includes(serviceName)}
            id={`${serviceName}-toggle`}
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
                pathname: getUrl("Inventory", {
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
          isHidden={!expanded.includes(serviceName)}
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

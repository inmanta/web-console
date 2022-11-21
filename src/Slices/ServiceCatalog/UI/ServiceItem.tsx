import React, { useContext, useRef, useState } from "react";
import { Link } from "react-router-dom";
import {
  Button,
  DataListItem,
  DataListItemRow,
  DataListItemCells,
  DataListCell,
  DataListAction,
  Text,
  Title,
  TextVariants,
  KebabToggle,
  Dropdown,
  Flex,
} from "@patternfly/react-core";
import styled from "styled-components";
import { ServiceModel } from "@/Core";
import { Spacer } from "@/UI/Components";
import { DependencyContext } from "@/UI/Dependency";
import { greyText } from "@/UI/Styles";
import { words } from "@/UI/words";
import { SummaryIcons } from "./SummaryIcons";

interface Props {
  service: ServiceModel;
}

export const ServiceItem: React.FunctionComponent<Props> = ({ service }) => {
  const { routeManager } = useContext(DependencyContext);
  const rowRefs = useRef<Record<string, HTMLSpanElement | null>>({});
  const [isOpen, setIsOpen] = useState(false);
  const serviceKey = service.name + "-item";

  return (
    <DataListItem id={service.name} aria-labelledby={serviceKey}>
      <span ref={(element) => (rowRefs.current[service.name] = element)} />
      <DataListItemRow>
        <DataListItemCells
          dataListCells={[
            <StyledDataListCell key="primary content">
              <Flex alignItems={{ default: "alignItemsCenter" }}>
                <Title id={serviceKey} headingLevel="h2" size="xl">
                  {service.name}
                </Title>
                {service.instance_summary && (
                  <SummaryIcons summary={service.instance_summary} />
                )}
              </Flex>
              {service.description && (
                <div id={`${service.name}-description`}>
                  <Spacer />
                  <StyledText component={TextVariants.small}>
                    {service.description}
                  </StyledText>
                  <Spacer />
                </div>
              )}
            </StyledDataListCell>,
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
            <Button variant="link">{words("catalog.button.inventory")}</Button>
          </Link>
          <Dropdown
            toggle={<KebabToggle onToggle={() => setIsOpen(!isOpen)} />}
            isOpen={isOpen}
            isPlain
            position="right"
            onSelect={() => setIsOpen(false)}
            aria-label="Actions-details"
            dropdownItems={[
              <Link
                key={service.name + "-detailsLink"}
                to={{
                  pathname: routeManager.getUrl("ServiceDetails", {
                    service: service.name,
                  }),
                  search: location.search,
                }}
              >
                <Button variant="link">
                  {words("catalog.button.details")}
                </Button>
              </Link>,
            ]}
          />
        </DataListAction>
      </DataListItemRow>
    </DataListItem>
  );
};

const StyledText = styled(Text)`
  ${greyText};
`;

const StyledDataListCell = styled(DataListCell)`
  display: flex;
  flex-direction: column;
  justify-content: center;
`;

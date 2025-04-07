import React from "react";
import { Grid, GridItem } from "@patternfly/react-core";
import styled from "styled-components";
import {
  ConfigSection,
  DetailsSection,
  HistorySection,
} from "./Components/Sections";
import { TabView } from "./Tabs";

/**
 * The ServiceInstanceDetailsLayout component
 *
 * @note The layout relies on Patternfly's Grid layout, and is made responsive for the different breakpoints.
 *
 * @returns  {React.FC} A React Component  that handles the layout of the ServiceInstanceDetails page.
 */
export const ServiceInstanceDetailsLayout: React.FC = () => {
  return (
    <StyledGrid
      id="Service-Instance-Details"
      hasGutter
      sm={12}
      md={4}
      lg={3}
      xl2={1}
    >
      <GridItem
        xl2={4}
        lg={5}
        rowSpan={12}
        sm={12}
        id="side-section"
        order={{ default: "-1", lg: "1" }}
      >
        <Grid hasGutter rowSpan={12}>
          <GridItem>
            <DetailsSection />
          </GridItem>
          <GridItem>
            <ConfigSection />
          </GridItem>
          <GridItem>
            <HistorySection />
          </GridItem>
        </Grid>
      </GridItem>
      <GridItem
        xl2={8}
        lg={7}
        rowSpan={12}
        sm={12}
        id="main-section"
        order={{ default: "1", lg: "-1" }}
      >
        <TabView />
      </GridItem>
    </StyledGrid>
  );
};

const StyledGrid = styled(Grid)`
  height: 100%;
`;

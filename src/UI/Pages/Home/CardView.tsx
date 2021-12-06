import React, { useContext } from "react";
import {
  Bullseye,
  Card,
  CardBody,
  CardFooter,
  CardHeader,
  CardTitle,
  EmptyState,
  EmptyStateIcon,
  EmptyStateVariant,
  Gallery,
  PageSection,
  Title,
} from "@patternfly/react-core";
import { PlusCircleIcon } from "@patternfly/react-icons";
import styled from "styled-components";
import { FlatEnvironment } from "@/Core";
import { DependencyContext } from "@/UI";
import { Link } from "@/UI/Components";
import { words } from "@/UI/words";
import { Actions } from "./Components";

interface Props {
  environments: FlatEnvironment[];
}

export const CardView: React.FC<Props> = ({ environments, ...props }) => {
  const { featureManager, routeManager } = useContext(DependencyContext);
  const pathname = featureManager.isLsmEnabled()
    ? routeManager.getUrl("Catalog", undefined)
    : routeManager.getUrl("CompileReports", undefined);

  return (
    <PageSection isFilled>
      <Gallery hasGutter {...props}>
        <CreateNewEnvironmentCard
          url={routeManager.getUrl("CreateEnvironment", undefined)}
        />
        {environments.map((environment) => (
          <EnvironmentCard
            pathname={pathname}
            environment={environment}
            key={`${environment.id}-${environment.projectName}`}
          />
        ))}
      </Gallery>
    </PageSection>
  );
};

const CreateNewEnvironmentCard: React.FC<{ url: string }> = ({ url }) => (
  <Card isHoverable isCompact>
    <Bullseye>
      <Link pathname={url}>
        <StyledCardContent>
          <EmptyState variant={EmptyStateVariant.xs}>
            <EmptyStateIcon icon={PlusCircleIcon} />
            <Title headingLevel="h2" size="md">
              {words("home.create.env.desciption")}
            </Title>
          </EmptyState>
        </StyledCardContent>
      </Link>
    </Bullseye>
  </Card>
);

interface EnvironmentCardProps {
  environment: FlatEnvironment;
  pathname: string;
}

const EnvironmentCard: React.FC<EnvironmentCardProps> = ({
  environment,
  pathname,
}) => (
  <Card isHoverable isCompact aria-label={"Environment card"}>
    <CardHeader>
      {environment.icon && (
        <img
          style={{ height: "2em" }}
          src={`data:${environment.icon}`}
          alt={words("home.environment.icon")(environment.name)}
        ></img>
      )}
      <Actions environment={environment} />
    </CardHeader>
    <CardTitle>{environment.name}</CardTitle>
    <CardBody>
      <StyledCardContent>{environment.description}</StyledCardContent>
    </CardBody>
    <CardFooter>
      <Link pathname={pathname} search={`env=${environment.id}`}>
        {words("home.environment.select")}
      </Link>
      <StyledFooterDiv>{environment.projectName}</StyledFooterDiv>
    </CardFooter>
  </Card>
);

const StyledCardContent = styled.div`
  overflow-wrap: break-word;
`;

const StyledFooterDiv = styled.div`
  color: var(--pf-global--secondary-color--100);
`;

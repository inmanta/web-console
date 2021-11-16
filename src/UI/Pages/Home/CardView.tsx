import React, { useContext } from "react";
import {
  Bullseye,
  Button,
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
    <PageSection>
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
    <Link pathname={url}>
      <Bullseye>
        <StyledCardContent>
          <EmptyState variant={EmptyStateVariant.xs}>
            <EmptyStateIcon icon={PlusCircleIcon} />
            <Title headingLevel="h2" size="md">
              {words("home.create.env.desciption")}
            </Title>
          </EmptyState>
        </StyledCardContent>
      </Bullseye>
    </Link>
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
      <CardTitle>{environment.name}</CardTitle>
      <Actions environment={environment} />
    </CardHeader>
    <CardBody>
      <Bullseye>
        <Link pathname={pathname} search={`env=${environment.id}`}>
          <StyledCardContent>
            <Button variant="secondary">
              {words("home.environment.select")}
            </Button>
          </StyledCardContent>
        </Link>
      </Bullseye>
    </CardBody>
    <StyledFooter>{environment.projectName}</StyledFooter>
  </Card>
);

const StyledCardContent = styled.div`
  margin: 0.5em;
`;

const StyledFooter = styled(CardFooter)`
  color: var(--pf-global--secondary-color--100);
`;

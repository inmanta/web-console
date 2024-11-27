import React, { useContext } from "react";
import {
  Brand,
  Bullseye,
  Card,
  CardBody,
  CardFooter,
  CardHeader,
  CardTitle,
  Content,
  EmptyState,
  EmptyStateVariant,
  Gallery,
  Label,
  PageSection,
  Title,
} from "@patternfly/react-core";
import { PlusCircleIcon } from "@patternfly/react-icons";
import { FlatEnvironment } from "@/Core";
import { DependencyContext } from "@/UI";
import { words } from "@/UI/words";
import fallBackImage from "@images/inmanta-wings.svg";

interface Props {
  environments: FlatEnvironment[];
}

export const CardView: React.FC<Props> = ({ environments, ...props }) => {
  const { routeManager } = useContext(DependencyContext);
  const pathname = routeManager.getUrl("Dashboard", undefined);

  return (
    <PageSection hasBodyWrapper={false}>
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
  <Card isClickable isCompact variant="secondary">
    <CardHeader
      selectableActions={{
        to: url,
        selectableActionAriaLabelledby: "Create-environment",
      }}
    ></CardHeader>
    <Bullseye>
      <Content>
        <EmptyState variant={EmptyStateVariant.xs} icon={PlusCircleIcon}>
          <Title headingLevel="h2" size="md">
            {words("home.create.env.desciption")}
          </Title>
        </EmptyState>
      </Content>
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
}) => {
  return (
    <Card
      isClickable
      aria-label="Environment card"
      data-testid="Environment card"
    >
      <CardHeader
        selectableActions={{
          to: `${pathname}?env=${environment.id}`,
          selectableActionAriaLabelledby: "Select-environment",
        }}
      >
        <Brand
          src={environment.icon ? `data:${environment.icon}` : fallBackImage}
          alt="environment-logo"
          style={{ maxHeight: "50px", maxWidth: "200px" }}
        />
        <CardTitle>
          <Title headingLevel="h3">{environment.name}</Title>
        </CardTitle>
      </CardHeader>
      <CardBody>
        <Content>{environment.description}</Content>
      </CardBody>
      <CardFooter>
        <Label>{environment.projectName}</Label>
      </CardFooter>
    </Card>
  );
};

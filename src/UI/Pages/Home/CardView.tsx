import { FlatEnvironment } from "@/Core";
import { DependencyContext } from "@/UI";
import { getUrl } from "@/UI/Routing";
import { words } from "@/UI/words";
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
  EmptyStateSecondaryActions,
  EmptyStateVariant,
  Gallery,
  PageSection,
  Title,
} from "@patternfly/react-core";
import { PlusCircleIcon } from "@patternfly/react-icons";
import React, { useContext } from "react";
import { Link } from "react-router-dom";

interface Props {
  environments: FlatEnvironment[];
}

export const CardView: React.FC<Props> = ({ environments, ...props }) => {
  const { featureManager } = useContext(DependencyContext);
  const pathname = featureManager.isLsmEnabled()
    ? getUrl("Catalog", undefined)
    : getUrl("CompileReports", undefined);

  return (
    <PageSection>
      <Gallery hasGutter {...props}>
        <CreateNewEnvironmentCard />
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

const CreateNewEnvironmentCard: React.FC = () => (
  <Card isHoverable isCompact>
    <Bullseye>
      <EmptyState variant={EmptyStateVariant.xs}>
        <EmptyStateIcon icon={PlusCircleIcon} />
        <Title headingLevel="h2" size="md">
          {words("home.create.env.desciption")}
        </Title>
        <EmptyStateSecondaryActions>
          <Button variant="link" isDisabled>
            {words("home.create.env.link")}
          </Button>
        </EmptyStateSecondaryActions>
      </EmptyState>
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
      <CardTitle>{environment.name}</CardTitle>
    </CardHeader>
    <CardBody>
      <Bullseye>
        <Link to={{ pathname, search: `env=${environment.id}` }}>
          <Button variant="secondary">
            {words("home.environment.select")}
          </Button>
        </Link>
      </Bullseye>
    </CardBody>
    <CardFooter style={{ color: "gray" }}>{environment.projectName}</CardFooter>
  </Card>
);

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
import { FlatEnvironment } from "@/Core";
import { DependencyContext } from "@/UI";
import { getUrl } from "@/UI/Routing";
import { words } from "@/UI/words";
import { Link } from "@/UI/Components";
import { Actions } from "./Components";

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
    <Link pathname={getUrl("CreateEnvironment", undefined)}>
      <Bullseye>
        <EmptyState variant={EmptyStateVariant.xs}>
          <EmptyStateIcon icon={PlusCircleIcon} />
          <Title headingLevel="h2" size="md">
            {words("home.create.env.desciption")}
          </Title>
        </EmptyState>
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
          <Button variant="secondary">
            {words("home.environment.select")}
          </Button>
        </Link>
      </Bullseye>
    </CardBody>
    <CardFooter style={{ color: "gray" }}>{environment.projectName}</CardFooter>
  </Card>
);

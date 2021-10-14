import React, { useContext, useState } from "react";
import {
  Bullseye,
  Button,
  Card,
  CardActions,
  CardBody,
  CardFooter,
  CardHeader,
  CardTitle,
  Dropdown,
  DropdownItem,
  EmptyState,
  EmptyStateIcon,
  EmptyStateSecondaryActions,
  EmptyStateVariant,
  Gallery,
  KebabToggle,
  PageSection,
  Title,
} from "@patternfly/react-core";
import { PencilAltIcon, PlusCircleIcon } from "@patternfly/react-icons";
import { FlatEnvironment } from "@/Core";
import { DependencyContext } from "@/UI";
import { getUrl } from "@/UI/Routing";
import { words } from "@/UI/words";
import { Link } from "@/UI/Components";

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
      <Actions environmentId={environment.id} />
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

const Actions: React.FC<{ environmentId: string }> = ({ environmentId }) => {
  const [isOpen, setIsOpen] = useState(false);
  return (
    <CardActions>
      <Dropdown
        onSelect={() => setIsOpen((value) => !value)}
        toggle={<KebabToggle onToggle={() => setIsOpen((value) => !value)} />}
        isOpen={isOpen}
        isPlain
        dropdownItems={[
          <DropdownItem
            key="settings"
            component={
              <Link
                pathname={getUrl("Settings", undefined)}
                search={`env=${environmentId}`}
              >
                <Button variant="link" icon={<PencilAltIcon />}>
                  {words("home.environment.edit")}
                </Button>
              </Link>
            }
          />,
        ]}
        position={"right"}
      />
    </CardActions>
  );
};

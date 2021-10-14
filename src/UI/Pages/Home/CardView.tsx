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
import {
  PencilAltIcon,
  PlusCircleIcon,
  TrashAltIcon,
} from "@patternfly/react-icons";
import { FlatEnvironment } from "@/Core";
import { DependencyContext } from "@/UI";
import { getUrl, useGoTo } from "@/UI/Routing";
import { words } from "@/UI/words";
import { Link } from "@/UI/Components";
import { DeleteModal } from "./Components";

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

interface ActionsProps {
  environment: Pick<FlatEnvironment, "id" | "name">;
}

const Actions: React.FC<ActionsProps> = ({ environment }) => {
  const [isToggleOpen, setIsToggleOpen] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const goTo = useGoTo();
  return (
    <>
      <DeleteModal
        environmentName={environment.name}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />
      <CardActions>
        <Dropdown
          onSelect={() => setIsToggleOpen((value) => !value)}
          toggle={
            <KebabToggle onToggle={() => setIsToggleOpen((value) => !value)} />
          }
          isOpen={isToggleOpen}
          isPlain
          dropdownItems={[
            <DropdownItem
              key="edit environment"
              icon={<PencilAltIcon />}
              onClick={() =>
                goTo("Settings", undefined, `env=${environment.id}`)
              }
            >
              {words("home.environment.edit")}
            </DropdownItem>,
            <DropdownItem
              key="delete environment"
              icon={<TrashAltIcon />}
              onClick={() => setIsModalOpen(true)}
            >
              {words("home.environment.delete")}
            </DropdownItem>,
          ]}
          position={"right"}
        />
      </CardActions>
    </>
  );
};

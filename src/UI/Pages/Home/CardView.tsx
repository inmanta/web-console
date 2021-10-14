import { FlatEnvironment } from "@/Core";
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
import React from "react";
import { Link } from "react-router-dom";

interface Props {
  environments: FlatEnvironment[];
}

export const CardView: React.FC<Props> = ({ environments, ...props }) => (
  <PageSection>
    <Gallery hasGutter {...props}>
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
      {environments.map((environment) => (
        <Card
          isHoverable
          isCompact
          key={`${environment.id}-${environment.projectName}`}
          aria-label={"Environment card"}
        >
          <CardHeader>
            <CardTitle>{environment.name}</CardTitle>
          </CardHeader>
          <CardBody>
            <Bullseye>
              <Link
                to={{
                  pathname: getUrl("Catalog", undefined),
                  search: `env=${environment.id}`,
                }}
              >
                <Button variant="secondary">
                  {words("home.environment.select")}
                </Button>
              </Link>
            </Bullseye>
          </CardBody>
          <CardFooter style={{ color: "gray" }}>
            {environment.projectName}
          </CardFooter>
        </Card>
      ))}
    </Gallery>
  </PageSection>
);

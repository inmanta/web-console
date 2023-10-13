import React, { useContext } from "react";
import {
  Bullseye,
  Card,
  CardBody,
  CardFooter,
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

interface Props {
  environments: FlatEnvironment[];
}

export const CardView: React.FC<Props> = ({ environments, ...props }) => {
  const { routeManager } = useContext(DependencyContext);
  const pathname = routeManager.getUrl("Dashboard", undefined);

  return (
    <PageSection isFilled>
      <Gallery
        hasGutter
        minWidths={{
          default: "30ch",
        }}
        maxWidths={{
          default: "30ch",
        }}
        {...props}
      >
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
  <StyledCard isClickable isCompact>
    <Bullseye>
      <Link pathname={url}>
        <StyledCardContent>
          <AlignedEmptyState variant={EmptyStateVariant.xs}>
            <EmptyStateIcon icon={PlusCircleIcon} />
            <Title headingLevel="h2" size="md">
              {words("home.create.env.desciption")}
            </Title>
          </AlignedEmptyState>
        </StyledCardContent>
      </Link>
    </Bullseye>
  </StyledCard>
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
    <StyledLink pathname={pathname} search={`env=${environment.id}`}>
      <StyledCard
        isClickable
        isCompact
        aria-label={"Environment card"}
        data-testid="Environment card"
      >
        <StyledTitle component="h4">
          {environment.icon ? (
            <StyledIcon
              src={`data:${environment.icon}`}
              alt={words("home.environment.icon")(environment.name)}
              aria-label={`${environment.name}-icon`}
            />
          ) : (
            <FillerIcon aria-label={`${environment.name}-icon`}>
              {environment.name[0].toUpperCase()}
            </FillerIcon>
          )}
          {environment.name}
        </StyledTitle>
        <CardBody>
          <StyledCardContent>{environment.description}</StyledCardContent>
        </CardBody>
        <CardFooter>
          <StyledFooterDiv>{environment.projectName}</StyledFooterDiv>
        </CardFooter>
      </StyledCard>
    </StyledLink>
  );
};

const StyledLink = styled(Link)`
  text-decoration: auto;
  color: var(--pf-v5-global--Color--100);
`;

const StyledCardContent = styled.div`
  white-space: pre-wrap;
  height: 20ch;
`;

const StyledFooterDiv = styled.div`
  color: var(--pf-v5-global--secondary-color--100);
`;

const StyledIcon = styled.img`
  width: 40px;
  height: 40px;
  object-fit: contain;
  display: inline-block;
`;

const FillerIcon = styled.div`
  display: inline-block;
  width: 40px;
  height: 40px;
  line-height: 40px;
  text-align: center;
  color: white;
  background-color: var(--pf-v5-global--custom-color--100);
  border-radius: 50%;
`;

const StyledTitle = styled(CardTitle)`
  display: flex;
  gap: 10px;
  flex-direction: row;
  flex-wrap: nowrap;
  align-items: center;
  font-weight: var(--pf-v5-global--FontWeight--bold);
}
`;

const StyledCard = styled(Card)`
  height: 30ch;
  &.pf-m-clickable:hover {
    box-shadow: var(--pf-v5-global--BoxShadow--lg);
  }
`;

const AlignedEmptyState = styled(EmptyState)`
  margin-top: 54px;
`;

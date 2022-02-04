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
  <StyledCard isHoverable isCompact>
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
}) => (
  <StyledCard isHoverable isCompact aria-label={"Environment card"}>
    <StyledLink pathname={pathname} search={`env=${environment.id}`}>
      <StyledHeader>
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
        <StyledTitle>{environment.name}</StyledTitle>
      </StyledHeader>
      <CardBody>
        <StyledCardContent>{environment.description}</StyledCardContent>
      </CardBody>
      <CardFooter>
        <StyledFooterDiv>{environment.projectName}</StyledFooterDiv>
      </CardFooter>
    </StyledLink>
  </StyledCard>
);

const StyledLink = styled(Link)`
  text-decoration: auto;
  color: var(--pf-global--Color--100);
`;

const StyledCardContent = styled.div`
  white-space: pre-wrap;
  height: 20ch;
`;

const StyledFooterDiv = styled.div`
  color: var(--pf-global--secondary-color--100);
`;

const StyledIcon = styled.img`
  width: 40px;
  height: 40px;
  object-fit: contain;
`;

const FillerIcon = styled.div`
  display: inline-block;
  width: 40px;
  height: 40px;
  line-height: 40px;
  text-align: center;
  color: white;
  background-color: var(--pf-global--default-color--100);
  border-radius: 50%;
`;

const StyledHeader = styled(CardHeader)`
  height: 64px;
`;

const StyledTitle = styled(CardTitle)`
  margin-left: 9px;
`;

const StyledCard = styled(Card)`
  height: 30ch;
`;

const AlignedEmptyState = styled(EmptyState)`
  margin-top: 54px;
`;

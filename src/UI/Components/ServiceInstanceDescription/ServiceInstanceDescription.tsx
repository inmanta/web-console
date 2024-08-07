import React, { useContext } from "react";
import { Query, RemoteData } from "@/Core";
import { Description } from "@/UI/Components/Description";
import { DependencyContext } from "@/UI/Dependency";

interface Props {
  instanceId: string;
  serviceName: string;
  getDescription(id: string): string;
  data?: RemoteData.RemoteData<string, Query.Data<"GetServiceInstance">>;
  withSpace?: boolean;
  className?: string;
}

export const ServiceInstanceDescription: React.FC<Props> = (props) => {
  const { data } = props;

  if (data === undefined) return <DescriptionWithQuery {...props} />;

  return <DescriptionView {...props} data={data} />;
};

const DescriptionWithQuery: React.FC<Omit<Props, "data">> = ({
  instanceId,
  serviceName,
  ...props
}) => {
  const { queryResolver } = useContext(DependencyContext);
  const [data] = queryResolver.useContinuous<"GetServiceInstance">({
    kind: "GetServiceInstance",
    service_entity: serviceName,
    id: instanceId,
  });

  return <DescriptionView instanceId={instanceId} data={data} {...props} />;
};

type ViewProps = Omit<Props, "serviceName" | "data"> &
  Required<Pick<Props, "data">>;

const DescriptionView: React.FC<ViewProps> = ({
  instanceId,
  getDescription,
  data,
  className,
  withSpace,
}) => {
  if (!RemoteData.isSuccess(data)) return null;
  const id = data.value.service_identity_attribute_value || instanceId;

  return (
    <Description className={className} withSpace={withSpace}>
      {getDescription(id)}
    </Description>
  );
};

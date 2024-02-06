import React, { useContext } from "react";
import { PageContainer, RemoteDataView } from "@/UI/Components";
import { DependencyContext } from "@/UI/Dependency";
import { useRouteParams } from "@/UI/Routing";
import { CreateInstanceEditor } from "./Editor";

export const Page: React.FC = () => {
  const { service: serviceName } = useRouteParams<"CreateInstance">();
  const { queryResolver } = useContext(DependencyContext);

  const [data, retry] = queryResolver.useContinuous<"GetService">({
    kind: "GetService",
    name: serviceName,
  });

  return (
    <PageContainer title="JSON-editor: Create Instance">
      <RemoteDataView
        data={data}
        retry={retry}
        label="CreateInstanceEditor"
        SuccessView={(service) => (
          <div aria-label="AddInstanceEditor-Success">
            <CreateInstanceEditor serviceEntity={service} />
          </div>
        )}
      />
    </PageContainer>
  );
};

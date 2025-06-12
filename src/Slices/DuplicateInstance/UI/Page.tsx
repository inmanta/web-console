import React from "react";
import { useGetInstance, useGetServiceModel } from "@/Data/Queries";
import { Description, ErrorView, LoadingView, PageContainer } from "@/UI/Components";
import { useRouteParams } from "@/UI/Routing";
import { words } from "@/UI/words";
import { DuplicateForm } from "./DuplicateForm";

/**
 * Wrapper component for the duplicate instance page
 *
 * @props {React.PropsWithChildren<{ identifier: string }>} props - The properties for the PageWrapper component.
 * @prop {React.ReactNode} props.children - The children to be rendered inside the PageWrapper.
 * @prop {string} props.identifier - The identifier for the instance.
 * @returns {React.FC} A React functional component that renders the duplicate instance page.
 */
const PageWrapper: React.FC<React.PropsWithChildren<{ identifier: string }>> = ({
  children,
  identifier,
  ...props
}) => (
  <PageContainer {...props} pageTitle={words("inventory.duplicateInstance.title")}>
    <Description withSpace>{words("inventory.duplicateInstance.header")(identifier)}</Description>

    {children}
  </PageContainer>
);

/**
 * Page component for duplicating an instance
 *
 * @returns {React.FC} A React functional component that renders the duplicate instance page.
 */
export const Page: React.FC = () => {
  const { service: serviceName, instance } = useRouteParams<"DuplicateInstance">();
  const serviceModel = useGetServiceModel(serviceName).useContinuous();
  const serviceInstance = useGetInstance(serviceName, instance).useContinuous();

  if (serviceModel.isError || serviceInstance.isError) {
    const retry = serviceModel.isError ? serviceModel.refetch : serviceInstance.refetch;

    return (
      <PageWrapper identifier={instance}>
        <ErrorView
          message={serviceModel.error?.message || serviceInstance.error?.message || "Unknown error"}
          ariaLabel="DuplicateInstance-Failed"
          retry={retry}
        />
      </PageWrapper>
    );
  }

  if (serviceModel.isSuccess && serviceInstance.isSuccess) {
    const { service_identity_attribute_value } = serviceInstance.data;
    const identifier = service_identity_attribute_value
      ? service_identity_attribute_value
      : instance;

    return (
      <PageWrapper identifier={identifier}>
        <div aria-label="DuplicateInstance-Success">
          <DuplicateForm instance={serviceInstance.data} serviceEntity={serviceModel.data} />
        </div>
      </PageWrapper>
    );
  }

  return (
    <PageWrapper identifier={instance}>
      <LoadingView ariaLabel="DuplicateInstance-Loading" />
    </PageWrapper>
  );
};

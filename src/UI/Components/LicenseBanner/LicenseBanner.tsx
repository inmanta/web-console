import React, { useContext } from "react";
import { Banner } from "@patternfly/react-core";
import { DependencyContext } from "@/UI/Dependency";
import { words } from "@/UI/words";

/**
 * @returns Either a banner informing the user his/her license has expired.
 */
export const LicenseBanner: React.FC = () => {
  const { featureManager } = useContext(DependencyContext);
  const status = featureManager.getLicenseInformation();
  const expirationMessage = getExpirationMessage(
    status?.entitlement_valid_until,
    status?.cert_valid_until,
  );

  return expirationMessage ? (
    <Banner isSticky variant="danger">
      {expirationMessage}
    </Banner>
  ) : null;
};

/**
 * cert_valid_until
 * entitlement_valid_until
 *
 * Will calculate the time difference in days between today and the arg date.
 * If the return value is negative, this means the date is expired.
 * @param validUntilDate
 * @returns number
 */
const checkExpiration = (validUntilDate: string) => {
  const today = new Date();
  const validityDate = new Date(validUntilDate);

  const timeDifference = validityDate.getTime() - today.getTime();

  return Math.round(timeDifference / 86400000);
};

/**
 *
 * @param entitlementDate
 * @param certificateDate
 * @returns either a message containing the amount of days the certificate has expired,
 * or either null if not expired.
 */
const getExpirationMessage = (entitlementDate, certificateDate) => {
  if (!entitlementDate || !certificateDate) {
    return null;
  }

  const diffTimeCertificate = checkExpiration(certificateDate);
  const diffTimeEntitlement = checkExpiration(entitlementDate);

  if (diffTimeCertificate < 0) {
    return words("banner.certificate.expired")(Math.abs(diffTimeCertificate));
  }
  if (diffTimeCertificate < 15) {
    return words("banner.certificate.will.expire")(
      Math.abs(diffTimeCertificate),
    );
  } else if (diffTimeEntitlement < 0) {
    return words("banner.entitlement.expired")(Math.abs(diffTimeEntitlement));
  }

  return null;
};

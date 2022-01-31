import React from "react";
import { ReactDiffViewExample } from "./ReactDiffViewExample";

export default {
  title: "ReactDiffViewExample",
  component: ReactDiffViewExample,
};

export const A: React.FC = () => {
  const text = `diff --git a/package.json b/package.json
index 535eea08..f26723f7 100644
--- a/package.json
+++ b/package.json
@@ -143,2 +143,3 @@
     "qs": "^6.10.2",
+    "react-diff-view": "^2.4.9",
     "react-keycloak": "^6.1.1",`;

  return <ReactDiffViewExample diffText={text} />;
};

export const B: React.FC = () => {
  return (
    <ReactDiffViewExample
      diffText={"--- \n+++ \n@@ -0,0 +1 @@\n+data-network-internet1-1"}
    />
  );
};

export const C: React.FC = () => {
  const text =
    "--- \n+++ \n@@ -0,0 +1,41 @@\n+kubernetes::resources::ClusterRoleBinding[dc-1,identifier=/cluster/dc-1/role-binding/kc1-calicoctl]+kubernetes::resources::ClusterRoleBinding[dc-1,identifier=/cluster/dc-1/role-binding/system:serviceaccount:open5g:db]+kubernetes::resources::ClusterRole[dc-1,identifier=/cluster/dc-1/role/kc1-calicoctl]+kubernetes::resources::ClusterRole[dc-1,identifier=/cluster/dc-1/role/pod-service-endpoint-reader]+kubernetes::resources::ConfigMap[dc-1,identifier=/cluster/dc-1/namespace/control-plane-1/config-map/open5gs-amf-config-map]+kubernetes::resources::ConfigMap[dc-1,identifier=/cluster/dc-1/namespace/control-plane-1/config-map/open5gs-ausf-config-map]+kubernetes::resources::ConfigMap[dc-1,identifier=/cluster/dc-1/namespace/control-plane-1/config-map/open5gs-nrf-config-map]+kubernetes::resources::ConfigMap[dc-1,identifier=/cluster/dc-1/namespace/control-plane-1/config-map/open5gs-nssf-config-map]+kubernetes::resources::ConfigMap[dc-1,identifier=/cluster/dc-1/namespace/control-plane-1/config-map/open5gs-pcf-config-map]+kubernetes::resources::ConfigMap[dc-1,identifier=/cluster/dc-1/namespace/control-plane-1/config-map/open5gs-smf-config-map]+kubernetes::resources::ConfigMap[dc-1,identifier=/cluster/dc-1/namespace/control-plane-1/config-map/open5gs-udm-config-map]+kubernetes::resources::ConfigMap[dc-1,identifier=/cluster/dc-1/namespace/control-plane-1/config-map/open5gs-udr-config-map]+kubernetes::resources::ConfigMap[dc-1,identifier=/cluster/dc-1/namespace/control-plane-1/config-map/open5gs-web-client-agent-config-map]+kubernetes::resources::ConfigMap[dc-2,identifier=/cluster/dc-2/namespace/user-plane-1-1/config-map/open5gs-upf-config-map]+kubernetes::resources::Deployment[dc-1,identifier=/cluster/dc-1/namespace/control-plane-1/deployment/open5gs-ausf-deployment]+kubernetes::resources::Deployment[dc-1,identifier=/cluster/dc-1/namespace/control-plane-1/deployment/open5gs-nrf-deployment]+kubernetes::resources::Deployment[dc-1,identifier=/cluster/dc-1/namespace/control-plane-1/deployment/open5gs-nssf-deployment]+kubernetes::resources::Deployment[dc-1,identifier=/cluster/dc-1/namespace/control-plane-1/deployment/open5gs-pcf-deployment]+kubernetes::resources::Deployment[dc-1,identifier=/cluster/dc-1/namespace/control-plane-1/deployment/open5gs-udm-deployment]+kubernetes::resources::Deployment[dc-1,identifier=/cluster/dc-1/namespace/control-plane-1/deployment/open5gs-udr-deployment]+kubernetes::resources::Namespace[dc-1,identifier=/cluster/dc-1/namespace/control-plane-1]+kubernetes::resources::Namespace[dc-1,identifier=/cluster/dc-1/namespace/kube-system]+kubernetes::resources::Namespace[dc-2,identifier=/cluster/dc-2/namespace/user-plane-1-1]+kubernetes::resources::Pod[dc-1,identifier=/cluster/dc-1/namespace/kube-system/pod/kc1-calicoctl]+kubernetes::resources::Secret[dc-1,identifier=/cluster/dc-1/namespace/control-plane-1/secret/image-pull-secret]+kubernetes::resources::Secret[dc-1,identifier=/cluster/dc-1/namespace/kube-system/secret/image-pull-secret]+kubernetes::resources::Secret[dc-2,identifier=/cluster/dc-2/namespace/user-plane-1-1/secret/image-pull-secret]+kubernetes::resources::ServiceAccount[dc-1,identifier=/cluster/dc-1/namespace/control-plane-1/service-account/db]+kubernetes::resources::ServiceAccount[dc-1,identifier=/cluster/dc-1/namespace/kube-system/service-account/kc1-calicoctl]+kubernetes::resources::Service[dc-1,identifier=/cluster/dc-1/namespace/control-plane-1/service/open5gs-amf-svc-pool]+kubernetes::resources::Service[dc-1,identifier=/cluster/dc-1/namespace/control-plane-1/service/open5gs-db-svc]+kubernetes::resources::Service[dc-1,identifier=/cluster/dc-1/namespace/control-plane-1/service/open5gs-smf-svc-pool]+kubernetes::resources::Service[dc-1,identifier=/cluster/dc-1/namespace/control-plane-1/service/open5gs-web-ui-svc-pool]+kubernetes::resources::Service[dc-2,identifier=/cluster/dc-2/namespace/user-plane-1-1/service/open5gs-upf-svc-pool]+kubernetes::resources::StatefulSet[dc-1,identifier=/cluster/dc-1/namespace/control-plane-1/stateful-set/open5gs-amf-stateful-set]+kubernetes::resources::StatefulSet[dc-1,identifier=/cluster/dc-1/namespace/control-plane-1/stateful-set/open5gs-db-stateful-set]+kubernetes::resources::StatefulSet[dc-1,identifier=/cluster/dc-1/namespace/control-plane-1/stateful-set/open5gs-smf-stateful-set]+kubernetes::resources::StatefulSet[dc-1,identifier=/cluster/dc-1/namespace/control-plane-1/stateful-set/open5gs-web-ui-stateful-set]+kubernetes::resources::StatefulSet[dc-2,identifier=/cluster/dc-2/namespace/user-plane-1-1/stateful-set/open5gs-upf-stateful-set]+lsm::LifecycleTransfer[internal,instance_id=9fecf8cb-3c85-4118-ad14-1c0ecc73f378]+lsm::LifecycleTransfer[internal,instance_id=e1e81a0f-2688-4115-9879-12f23ee647fb]";
  return <ReactDiffViewExample diffText={text} />;
};

export const D: React.FC = () => {
  const text = `--- /dev/fd/11
+++ /dev/fd/12
@@ -1 +1 @@
-data-network-internet1-1
+data-network-internet1-2`;
  return <ReactDiffViewExample diffText={text} />;
};

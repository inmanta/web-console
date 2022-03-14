import { Diff } from "@/Core";

export const resources: Diff.Resource[] = [
  {
    resource_id:
      "lsm::LifecycleTransfer[internal,instance_id=095339a2-54af-491e-9450-00000001]",
    attributes: {
      next_version: {
        from_value: 9,
        to_value: 10,
        from_value_compare: "9",
        to_value_compare: "10",
      },
    },
    status: "modified",
  },
  {
    resource_id:
      "lsm::LifecycleTransfer[internal,instance_id=5d25ffbe-c59c-4d03-8f7c-000000002]",
    attributes: {
      next_version: {
        from_value: 7,
        to_value: 8,
        from_value_compare: "7",
        to_value_compare: "8",
      },
    },
    status: "modified",
  },
  {
    resource_id:
      "lsm::LifecycleTransfer[internal,instance_id=5d25ffbe-c59c-4d03-8f7c-0000000003]",
    attributes: {
      next_version: {
        from_value: null,
        to_value: null,
        from_value_compare:
          "kubernetes::resources::ClusterRoleBinding[dc-1,identifier=/cluster/dc-1/role-binding/kc1-calicoctl]\nkubernetes::resources::ClusterRoleBinding[dc-1,identifier=/cluster/dc-1/role-binding/system:serviceaccount:open5g:db]\nkubernetes::resources::ClusterRole[dc-1,identifier=/cluster/dc-1/role/kc1-calicoctl]\nkubernetes::resources::ClusterRole[dc-1,identifier=/cluster/dc-1/role/pod-service-endpoint-reader]\nkubernetes::resources::ConfigMap[dc-1,identifier=/cluster/dc-1/namespace/control-plane-1/config-map/open5gs-amf-config-map]\nkubernetes::resources::ConfigMap[dc-1,identifier=/cluster/dc-1/namespace/control-plane-1/config-map/open5gs-ausf-config-map]\nkubernetes::resources::ConfigMap[dc-1,identifier=/cluster/dc-1/namespace/control-plane-1/config-map/open5gs-nrf-config-map]\nkubernetes::resources::ConfigMap[dc-1,identifier=/cluster/dc-1/namespace/control-plane-1/config-map/open5gs-nssf-config-map]\nkubernetes::resources::ConfigMap[dc-1,identifier=/cluster/dc-1/namespace/control-plane-1/config-map/open5gs-pcf-config-map]\nkubernetes::resources::ConfigMap[dc-1,identifier=/cluster/dc-1/namespace/control-plane-1/config-map/open5gs-smf-config-map]\nkubernetes::resources::ConfigMap[dc-1,identifier=/cluster/dc-1/namespace/control-plane-1/config-map/open5gs-udm-config-map]\nkubernetes::resources::ConfigMap[dc-1,identifier=/cluster/dc-1/namespace/control-plane-1/config-map/open5gs-udr-config-map]\nkubernetes::resources::ConfigMap[dc-1,identifier=/cluster/dc-1/namespace/control-plane-1/config-map/open5gs-web-client-agent-config-map]\nkubernetes::resources::ConfigMap[dc-2,identifier=/cluster/dc-2/namespace/user-plane-1-1/config-map/open5gs-upf-config-map]\n",
        to_value_compare:
          "kubernetes::resources::ClusterRoleBinding[dc-1,identifier=/cluster/dc-1/role-binding/system:serviceaccount:open5g:db]\nkubernetes::resources::ClusterRole[dc-1,identifier=/cluster/dc-1/role/kc1-calicoctl]\nkubernetes::resources::ClusterRole[dc-1,identifier=/cluster/dc-1/role/pod-service-endpoint-reader]\nkubernetes::resources::ConfigMap[dc-1,identifier=/cluster/dc-1/namespace/control-plane-1/config-map/open5gs-amf-config-map]\nkubernetes::resources::ConfigMap[dc-1,identifier=/cluster/dc-1/namespace/control-plane-1/config-map/open5gs-ausf-config-map]\nkubernetes::resources::ConfigMap[dc-1,identifier=/cluster/dc-1/namespace/control-plane-1/config-map/open5gs-nrf-config-map]\nkubernetes::resources::ConfigMap[dc-1,identifier=/cluster/dc-1/namespace/control-plane-1/config-map/open5gs-nssf-config-map]\nkubernetes::resources::ConfigMap[dc-1,identifier=/cluster/dc-1/namespace/control-plane-1/config-map/open5gs-pcf-config-map]\nkubernetes::resources::ConfigMap[dc-1,identifier=/cluster/dc-1/namespace/control-plane-1/config-map/open5gs-smf-config-map]\nkubernetes::resources::ConfigMap[dc-1,identifier=/cluster/dc-1/namespace/control-plane-1/config-map/open5gs-udm-config-map]\nkubernetes::resources::ConfigMap[dc-1,identifier=/cluster/dc-1/namespace/control-plane-1/config-map/open5gs-udr-config-map]\nkubernetes::resources::ConfigMap[dc-1,identifier=/cluster/dc-1/namespace/control-plane-1/config-map/open5gs-web-client-agent-config-map]\nkubernetes::resources::ConfigMap[dc-2,identifier=/cluster/dc-2/namespace/user-plane-1-1/config-map/open5gs-upf-config-map]\nkubernetes::resources::Deployment[dc-1,identifier=/cluster/dc-1/namespace/control-plane-1/deployment/open5gs-ausf-deployment]\nkubernetes::resources::Deployment[dc-1,identifier=/cluster/dc-1/namespace/control-plane-1/deployment/open5gs-nrf-deployment]\nkubernetes::resources::Deployment[dc-1,identifier=/cluster/dc-1/namespace/control-plane-1/deployment/open5gs-nssf-deployment]\nkubernetes::resources::Deployment[dc-1,identifier=/cluster/dc-1/namespace/control-plane-1/deployment/open5gs-pcf-deployment]\n",
      },
    },
    status: "modified",
  },
  {
    resource_id:
      "lsm::LifecycleTransfer[internal,instance_id=5d25ffbe-c59c-4d03-8f7c-00000000004]",
    attributes: {
      next_version: {
        from_value: null,
        to_value: null,
        from_value_compare:
          '{\n    "config": {\n        "config": "apiVersion: v1\nclusters:\n  - cluster:\n      certificate-authority-data: LS0tLS1CRUdJTiBDRVJUSUZJQ0FURS0tLS0tCk1JSURCakNDQWU2Z0F3SUJBZ0lCQVRBTkJna3Foa2lHOXcwQkFRc0ZBREFWTVJNd0VRWURWUVFERXdwdGFXNXAKYTNWaVpVTkJNQjRYRFRJeE1EUXdPREE1TVRrd09Wb1hEVE14TURRd056QTVNVGt3T1Zvd0ZURVRNQkVHQTFVRQpBeE1LYldsdWFXdDFZbVZEUVRDQ0FTSXdEUVlKS29aSWh2Y05BUUVCQlFBRGdnRVBBRENDQVFvQ2dnRUJBTGQ2CnVadGVQUHVqdE1WYzNJMUNKWXBaU0s4UGlmMTBaTGd3Z25TUE1FVlBSNmtwb0VTbG1DbnM4RmRRd2liRnNUaVMKQ29HV29qQ2FXYldTeTE2cmtHN1d0emZObmFaUHJndUNkR1pKZC9ZaUhhTm5GSnVNVm5TWGYveGpuWVdLYWNDRgpkNDd0Z0JWWkpDR3Q2TXl5MndxNTdRQTV1dHkyTkVtWmZ6V1AxVTBDWkhTZTl4T2I3LzFlTmpBLy9sN0MzM2pMCnluYkpGM01BamYzcVZ4Y2JRRC9lUU5MVGZITFQrRFRlZjVpRnI1a01NeUc0ZGNkZVE2V0ZkQzdyZ094aG9EaVQKSGdNd2ZZZ04yN1Jla0wxRnFrOUx4RWhrNWJUbEd1R0hBZFNUUWdsa1VPYWQ4UCtaY0xYZHBhb2xodG41a3ZkdwpLNWIxYzVXSHh4WkRneWxkWjJVQ0F3RUFBYU5oTUY4d0RnWURWUjBQQVFIL0JBUURBZ0trTUIwR0ExVWRKUVFXCk1CUUdDQ3NHQVFVRkJ3TUNCZ2dyQmdFRkJRY0RBVEFQQmdOVkhSTUJBZjhFQlRBREFRSC9NQjBHQTFVZERnUVcKQkJSamYyeUVZYlVjd1Z6QldZS2IvYURMR1ltclBUQU5CZ2txaGtpRzl3MEJBUXNGQUFPQ0FRRUFGMGN6N2RnOApjMTl5TWZkT2FoZmVESHJnWlkyU0dYOWxhSEs3WHNxTHZ1c2NMYjBQVlk4RXB2c25xbjBWZHBMaVNhNys0WTkxCnpMZUdDYWgxQURCUEx1N2pHNHZjczd0dmZJRGdjNU1SWmhpZzFucCtMdU9xeXJ1N01yTE9kNnVYajBGZVdORFcKMGpReFEwVnBQY1pDd1haRzlXSHhsaTdlZ084MmhhNmdqRnM4WVVFVytjZHJPRXNlbkEvQ3VTbUFZdmF5cWJRbApQcStHUmowV0xYN1BCeWpYcGFVTnRTUFJnbUQwbEorZytzNnVBeG9UOWNHeWVzQmdySWVYWE5Ebnp0SElVZ3VnCmROSGVSMUovUiswWmZxUGllK3ljNFBLVFJsVjdtMzBkZmszUkFOVWo5SU9naEdCcnlkOE0vNDlvbTBoeStrT3IKZmxlVU00M1RNZXhOT1E9PQotLS0tLUVORCBDRVJUSUZJQ0FURS0tLS0tCg==\n      extensions:\n        - extension:\n            last-update: Thu, 04 Mar 2021 11:40:46 UTC\n            provider: minikube.sigs.k8s.io\n            version: v1.17.1\n          name: cluster_info\n      server: https://192.168.2.37:8443\n    name: minikube\ncontexts:\n  - context:\n      cluster: minikube\n      extensions:\n        - extension:\n            last-update: Thu, 04 Mar 2021 11:40:46 UTC\n            provider: minikube.sigs.k8s.io\n            version: v1.17.1\n          name: context_info\n      namespace: default\n      user: minikube\n    name: minikube\ncurrent-context: minikube\nkind: Config\npreferences: {}\nusers:\n  - name: minikube\n    user:\n      client-certificate-data: LS0tLS1CRUdJTiBDRVJUSUZJQ0FURS0tLS0tCk1JSURJVENDQWdtZ0F3SUJBZ0lCQWpBTkJna3Foa2lHOXcwQkFRc0ZBREFWTVJNd0VRWURWUVFERXdwdGFXNXAKYTNWaVpVTkJNQjRYRFRJeE1EUXdPREE1TVRrd09Wb1hEVEl5TURRd09UQTVNVGt3T1Zvd01URVhNQlVHQTFVRQpDaE1PYzNsemRHVnRPbTFoYzNSbGNuTXhGakFVQmdOVkJBTVREVzFwYm1scmRXSmxMWFZ6WlhJd2dnRWlNQTBHCkNTcUdTSWIzRFFFQkFRVUFBNElCRHdBd2dnRUtBb0lCQVFESzdTUVlzbWREVkc5NnJBNSs4dkVCOWJHTnZPaDMKLzVNUlJlNEVoUXBUODUrMGsydUFHdElLdXF3SHNYdGpjTWNMLytSMWNoOXlQVzhyUnF2NGt5bnBrbW9uUTRycwpSVjc5TUduMFZjY29meXBLWWZxUDBidGFJaVh4Q1lrWlNWUHVpbWRLRnUyNmQxZndWb0orbGVEOFBPOUtMVEFzCjQ0UUlOS1BWOTV1d3c5aFpBT0IranhxdWNlRjlhY2psMURxbXZ4bXIrbDk2WWx4UWlBTWZBSFV4WVdabmM4dGQKRk40dVhOS1Y5YURRemtBUWhzVWJIbjVwOVF6UXNia3JJVVIxODRvTWVUWkt3MnVDaXIwVTI3NnZPSHNpVXFjUgpGdE5YelZxU2J6Z1FoTXkwY045NGg3cWZKZUovNXpHdlMzbVlYTzdQcjgxMmFGbE5TbUtJNzNGYkFnTUJBQUdqCllEQmVNQTRHQTFVZER3RUIvd1FFQXdJRm9EQWRCZ05WSFNVRUZqQVVCZ2dyQmdFRkJRY0RBUVlJS3dZQkJRVUgKQXdJd0RBWURWUjBUQVFIL0JBSXdBREFmQmdOVkhTTUVHREFXZ0JSamYyeUVZYlVjd1Z6QldZS2IvYURMR1ltcgpQVEFOQmdrcWhraUc5dzBCQVFzRkFBT0NBUUVBZ1dITDc5UFMwNzV5dU1vTG1XdnF3RFBVNFM2RUtqZUtZaGl6CnpZcTFVNUNpMjR3VjBOSnhrN1BNcGMzQkJWOUNKZmJxaHRSZXdWVWVlZWNkamlUcHJpUWJYL0FWS2s2ejF0MUIKTEdnU0lJUm9wV1JMcTc3QTRuSTNZWlZJNHkrMHIvQkYxZGR4R1B6UHU2OXl2UXFOVEJJaE8vZWNiUUhlbUNCSQphYVlDUHlKNXozSG9GcHRwNmZuMWdFbXVPMWlqVkpON2YwRWE4ak03NWp3b2hwTXZhR2JVZHFrWEd6S2htUDFaCk4yOE0rZ1Fwb3RDWHhxZmdpaDFjMVBqZXM4dWZzc0VHOGRpTDRoZnFvdFNGLzZZdHpNYmJrWXJkLy8weDU5angKVW90bnNTNlpCOWVTSk9SK0crVk1JWTlwT2NNVnUyM2lRZVpMdjdnOFdJMWNiOVptQWc9PQotLS0tLUVORCBDRVJUSUZJQ0FURS0tLS0tCg==\n      client-key-data: LS0tLS1CRUdJTiBSU0EgUFJJVkFURSBLRVktLS0tLQpNSUlFb3dJQkFBS0NBUUVBeXUwa0dMSm5RMVJ2ZXF3T2Z2THhBZld4amJ6b2QvK1RFVVh1QklVS1UvT2Z0Sk5yCmdCclNDcnFzQjdGN1kzREhDLy9rZFhJZmNqMXZLMGFyK0pNcDZaSnFKME9LN0VWZS9UQnA5RlhIS0g4cVNtSDYKajlHN1dpSWw4UW1KR1VsVDdvcG5TaGJ0dW5kWDhGYUNmcFhnL0R6dlNpMHdMT09FQ0RTajFmZWJzTVBZV1FEZwpmbzhhcm5IaGZXbkk1ZFE2cHI4WnEvcGZlbUpjVUlnREh3QjFNV0ZtWjNQTFhSVGVMbHpTbGZXZzBNNUFFSWJGCkd4NSthZlVNMExHNUt5RkVkZk9LREhrMlNzTnJnb3E5Rk51K3J6aDdJbEtuRVJiVFY4MWFrbTg0RUlUTXRIRGYKZUllNm55WGlmK2N4cjB0NW1GenV6Ni9OZG1oWlRVcGlpTzl4V3dJREFRQUJBb0lCQUNCMHdWczUzWTVGU1BkRAo0YVdvVWFmUWxpOW5VWDh2MzJQWjNYSFhuWWxENC8xTHZ0dmtia2ZOQjRyTGRrSzNYUDZzVk92NzdzK2t4ODBTCkpwdEJYbWkvUkQ4M2JGYlIyWm1CVHRFSGp5MEkrY2lmMXlWOWxBdWNmcGtJdjJiTjlhQ25mbEc1VFJpUDBmN2MKdDA1cnhtcFJqS3crZ2dBTCs2Z2NVei83dEdrWEFOR2pVaGtRN1Q3dmVuWjBuaS9kYTlUZW1JUk10RFlYMFdUdwp3RVZzYVFIWFBmWnRYUllNalY0QmFIenZUVGYvZ25HYjR5UmJtbS85elVTMEswSmFIRHR1V0ZFSCtDemdUT1IwCnNOVGRDSTFnWFZkZEZ1YXhvbENZYmFMeDRDQTNCZTk1TFpvRFcwRzVUaXhoa2pMb3ZmcFZNaHZOaG8vcHVTb1QKbFkwWFJzRUNnWUVBOFhDQllOSE5SZEpuaEVVMU1sLzlTT2RyOERHMFZKMndjYnpTWUdsekFqY2UwL281Y1JLMgp6b0VuZjBQNjBsMkxDdFQyRlVuWW1EQjRGS0FQMnVBQnArRFBlbUM0WHhqYzFMWUh3MndIRHMvS3pXQmppWkVJCllJMDRhbjZBQS80UnVGMGxSdjl0a3FmY2xoSnF6K2JkQmJZRS9yMCs4UXlWRHNZQTVOWm1jWXNDZ1lFQTF5b0wKcExDOHl2Sjk1aFl1dGZlMVdJOXlHS2NpQjl6d1FZRHpBVVVrWHlQZTFYL3p5RnFrVU1ZeXhnQmRJUVEzOW5CUApkYUxtZS83RkZXK29LNXAyMWZCRjBkajZOR3VzYTJmTlZmQ1dubFBCb0hwcDI1emN2Mnl1ckgybDlTZ2I0dVduCk5Dbnk1dTBRV05lVnQvdlh5b0tUejg4OCtsNlZlWjdjZWdSNldYRUNnWUJmQjN3MDRuOGNJME9SUVRnOStxQVQKeU5xb01MZ2NzZkJYNUEwZDI0Tmo5TlFTZFNPVXlOdmhEZDdBN2IzVWZQTVVNVndtWnVsMGhXZE9IdTMrcFRxaApuQSt0eUZIcFJEenZFREtnRFczOXUzWEVQbE1QTzJHRHR6SGtZS1A4YmswRk5zeE1WSThKTVQ3V1pxdFo1ekZKClpTbzBKY0tYVis5M1lDSEw4RU5rSHdLQmdRQ3RiRWM4TS9QSGhGSXpuTmVEZGFlbVBPQlN2SXR5V1FNUldQVUUKcGcwZDNoU2ljdUkwTDlMWEJCa3lmR0tUMVFtaVNYM1NMRDJuM1g1T3U5T0phWk8wOWxmZ1B3blVMS0VwWk40ZApFYkRrNWs5Zm9Lc29CclBxV3BnamtaYXRGZW44Sk94eTRBalhWbVpocFVvWXBCV1hOVTRjSmtaWTZ0bUIwS2lXCmRIdUZFUUtCZ0RvMXQzSGNpdTRuVHgvZjBnVVZTT0dPMTk0TzNnNFRqb29EbDhuRmZUaVlQd09La1A4TzNyOUQKVkpQMHBHcm5oYXVxbEFuSWdIY3B1amx3a3RKQ1BOM1FBVnpFSVhrQXY4ZzFXK0thUjFhQUZmVjNSLzg4VU5BWApFZUVWYlpsc2hUTXcwdkZueWhabFU2OXczbDhFSFdYVlhFaWRUbnBOa1VkM2poU3JvSVhQCi0tLS0tRU5EIFJTQSBQUklWQVRFIEtFWS0tLS0tCg==\n",\n        "context": "minikube"\n    },\n    "kind": "kube"\n}',
        to_value_compare:
          '{\n    "config": {\n        "config": "apiVersion: v2\nclusters:\n  - cluster:\n      certificate-authority-data: LS0tLS1CRUdJTiBDRVJUSUZJQ0FURS0tLS0tCk1JSURCakNDQWU2Z0F3SUJBZ0lCQVRBTkJna3Foa2lHOXcwQkFRc0ZBREFWTVJNd0VRWURWUVFERXdwdGFXNXAKYTNWaVpVTkJNQjRYRFRJeE1EUXdPREE1TVRrd09Wb1hEVE14TURRd056QTVNVGt3T1Zvd0ZURVRNQkVHQTFVRQpBeE1LYldsdWFXdDFZbVZEUVRDQ0FTSXdEUVlKS29aSWh2Y05BUUVCQlFBRGdnRVBBRENDQVFvQ2dnRUJBTGQ2CnVadGVQUHVqdE1WYzNJMUNKWXBaU0s4UGlmMTBaTGd3Z25TUE1FVlBSNmtwb0VTbG1DbnM4RmRRd2liRnNUaVMKQ29HV29qQ2FXYldTeTE2cmtHN1d0emZObmFaUHJndUNkR1pKZC9ZaUhhTm5GSnVNVm5TWGYveGpuWVdLYWNDRgpkNDd0Z0JWWkpDR3Q2TXl5MndxNTdRQTV1dHkyTkVtWmZ6V1AxVTBDWkhTZTl4T2I3LzFlTmpBLy9sN0MzM2pMCnluYkpGM01BamYzcVZ4Y2JRRC9lUU5MVGZITFQrRFRlZjVpRnI1a01NeUc0ZGNkZVE2V0ZkQzdyZ094aG9EaVQKSGdNd2ZZZ04yN1Jla0wxRnFrOUx4RWhrNWJUbEd1R0hBZFNUUWdsa1VPYWQ4UCtaY0xYZHBhb2xodG41a3ZkdwpLNWIxYzVXSHh4WkRneWxkWjJVQ0F3RUFBYU5oTUY4d0RnWURWUjBQQVFIL0JBUURBZ0trTUIwR0ExVWRKUVFXCk1CUUdDQ3NHQVFVRkJ3TUNCZ2dyQmdFRkJRY0RBVEFQQmdOVkhSTUJBZjhFQlRBREFRSC9NQjBHQTFVZERnUVcKQkJSamYyeUVZYlVjd1Z6QldZS2IvYURMR1ltclBUQU5CZ2txaGtpRzl3MEJBUXNGQUFPQ0FRRUFGMGN6N2RnOApjMTl5TWZkT2FoZmVESHJnWlkyU0dYOWxhSEs3WHNxTHZ1c2NMYjBQVlk4RXB2c25xbjBWZHBMaVNhNys0WTkxCnpMZUdDYWgxQURCUEx1N2pHNHZjczd0dmZJRGdjNU1SWmhpZzFucCtMdU9xeXJ1N01yTE9kNnVYajBGZVdORFcKMGpReFEwVnBQY1pDd1haRzlXSHhsaTdlZ084MmhhNmdqRnM4WVVFVytjZHJPRXNlbkEvQ3VTbUFZdmF5cWJRbApQcStHUmowV0xYN1BCeWpYcGFVTnRTUFJnbUQwbEorZytzNnVBeG9UOWNHeWVzQmdySWVYWE5Ebnp0SElVZ3VnCmROSGVSMUovUiswWmZxUGllK3ljNFBLVFJsVjdtMzBkZmszUkFOVWo5SU9naEdCcnlkOE0vNDlvbTBoeStrT3IKZmxlVU00M1RNZXhOT1E9PQotLS0tLUVORCBDRVJUSUZJQ0FURS0tLS0tCg==\n      extensions:\n        - extension:\n            last-update: Thu, 04 Mar 2021 11:40:46 UTC\n            provider: minikube.sigs.k8s.io\n            version: v1.17.1\n          name: cluster_info\n      server: https://192.168.2.37:8443\n    name: minikube\ncontexts:\n  - context:\n      cluster: minikube\n      extensions:\n        - extension:\n            last-update: Thu, 04 Mar 2021 11:40:46 UTC\n            provider: minikube.sigs.k8s.io\n            version: v1.17.1\n          name: context_info\n      namespace: default\n      user: minikube\n    name: minikube\ncurrent-context: minikube\nkind: Config\npreferences: {}\nusers:\n  - name: minikube\n    user:\n      client-certificate-data: LS0tLS1CRUdJTiBDRVJUSUZJQ0FURS0tLS0tCk1JSURJVENDQWdtZ0F3SUJBZ0lCQWpBTkJna3Foa2lHOXcwQkFRc0ZBREFWTVJNd0VRWURWUVFERXdwdGFXNXAKYTNWaVpVTkJNQjRYRFRJeE1EUXdPREE1TVRrd09Wb1hEVEl5TURRd09UQTVNVGt3T1Zvd01URVhNQlVHQTFVRQpDaE1PYzNsemRHVnRPbTFoYzNSbGNuTXhGakFVQmdOVkJBTVREVzFwYm1scmRXSmxMWFZ6WlhJd2dnRWlNQTBHCkNTcUdTSWIzRFFFQkFRVUFBNElCRHdBd2dnRUtBb0lCQVFESzdTUVlzbWREVkc5NnJBNSs4dkVCOWJHTnZPaDMKLzVNUlJlNEVoUXBUODUrMGsydUFHdElLdXF3SHNYdGpjTWNMLytSMWNoOXlQVzhyUnF2NGt5bnBrbW9uUTRycwpSVjc5TUduMFZjY29meXBLWWZxUDBidGFJaVh4Q1lrWlNWUHVpbWRLRnUyNmQxZndWb0orbGVEOFBPOUtMVEFzCjQ0UUlOS1BWOTV1d3c5aFpBT0IranhxdWNlRjlhY2psMURxbXZ4bXIrbDk2WWx4UWlBTWZBSFV4WVdabmM4dGQKRk40dVhOS1Y5YURRemtBUWhzVWJIbjVwOVF6UXNia3JJVVIxODRvTWVUWkt3MnVDaXIwVTI3NnZPSHNpVXFjUgpGdE5YelZxU2J6Z1FoTXkwY045NGg3cWZKZUovNXpHdlMzbVlYTzdQcjgxMmFGbE5TbUtJNzNGYkFnTUJBQUdqCllEQmVNQTRHQTFVZER3RUIvd1FFQXdJRm9EQWRCZ05WSFNVRUZqQVVCZ2dyQmdFRkJRY0RBUVlJS3dZQkJRVUgKQXdJd0RBWURWUjBUQVFIL0JBSXdBREFmQmdOVkhTTUVHREFXZ0JSamYyeUVZYlVjd1Z6QldZS2IvYURMR1ltcgpQVEFOQmdrcWhraUc5dzBCQVFzRkFBT0NBUUVBZ1dITDc5UFMwNzV5dU1vTG1XdnF3RFBVNFM2RUtqZUtZaGl6CnpZcTFVNUNpMjR3VjBOSnhrN1BNcGMzQkJWOUNKZmJxaHRSZXdWVWVlZWNkamlUcHJpUWJYL0FWS2s2ejF0MUIKTEdnU0lJUm9wV1JMcTc3QTRuSTNZWlZJNHkrMHIvQkYxZGR4R1B6UHU2OXl2UXFOVEJJaE8vZWNiUUhlbUNCSQphYVlDUHlKNXozSG9GcHRwNmZuMWdFbXVPMWlqVkpON2YwRWE4ak03NWp3b2hwTXZhR2JVZHFrWEd6S2htUDFaCk4yOE0rZ1Fwb3RDWHhxZmdpaDFjMVBqZXM4dWZzc0VHOGRpTDRoZnFvdFNGLzZZdHpNYmJrWXJkLy8weDU5angKVW90bnNTNlpCOWVTSk9SK0crVk1JWTlwT2NNVnUyM2lRZVpMdjdnOFdJMWNiOVptQWc9PQotLS0tLUVORCBDRVJUSUZJQ0FURS0tLS0tCg==\n      client-key-data: LS0tLS1CRUdJTiBSU0EgUFJJVkFURSBLRVktLS0tLQpNSUlFb3dJQkFBS0NBUUVBeXUwa0dMSm5RMVJ2ZXF3T2Z2THhBZld4amJ6b2QvK1RFVVh1QklVS1UvT2Z0Sk5yCmdCclNDcnFzQjdGN1kzREhDLy9rZFhJZmNqMXZLMGFyK0pNcDZaSnFKME9LN0VWZS9UQnA5RlhIS0g4cVNtSDYKajlHN1dpSWw4UW1KR1VsVDdvcG5TaGJ0dW5kWDhGYUNmcFhnL0R6dlNpMHdMT09FQ0RTajFmZWJzTVBZV1FEZwpmbzhhcm5IaGZXbkk1ZFE2cHI4WnEvcGZlbUpjVUlnREh3QjFNV0ZtWjNQTFhSVGVMbHpTbGZXZzBNNUFFSWJGCkd4NSthZlVNMExHNUt5RkVkZk9LREhrMlNzTnJnb3E5Rk51K3J6aDdJbEtuRVJiVFY4MWFrbTg0RUlUTXRIRGYKZUllNm55WGlmK2N4cjB0NW1GenV6Ni9OZG1oWlRVcGlpTzl4V3dJREFRQUJBb0lCQUNCMHdWczUzWTVGU1BkRAo0YVdvVWFmUWxpOW5VWDh2MzJQWjNYSFhuWWxENC8xTHZ0dmtia2ZOQjRyTGRrSzNYUDZzVk92NzdzK2t4ODBTCkpwdEJYbWkvUkQ4M2JGYlIyWm1CVHRFSGp5MEkrY2lmMXlWOWxBdWNmcGtJdjJiTjlhQ25mbEc1VFJpUDBmN2MKdDA1cnhtcFJqS3crZ2dBTCs2Z2NVei83dEdrWEFOR2pVaGtRN1Q3dmVuWjBuaS9kYTlUZW1JUk10RFlYMFdUdwp3RVZzYVFIWFBmWnRYUllNalY0QmFIenZUVGYvZ25HYjR5UmJtbS85elVTMEswSmFIRHR1V0ZFSCtDemdUT1IwCnNOVGRDSTFnWFZkZEZ1YXhvbENZYmFMeDRDQTNCZTk1TFpvRFcwRzVUaXhoa2pMb3ZmcFZNaHZOaG8vcHVTb1QKbFkwWFJzRUNnWUVBOFhDQllOSE5SZEpuaEVVMU1sLzlTT2RyOERHMFZKMndjYnpTWUdsekFqY2UwL281Y1JLMgp6b0VuZjBQNjBsMkxDdFQyRlVuWW1EQjRGS0FQMnVBQnArRFBlbUM0WHhqYzFMWUh3MndIRHMvS3pXQmppWkVJCllJMDRhbjZBQS80UnVGMGxSdjl0a3FmY2xoSnF6K2JkQmJZRS9yMCs4UXlWRHNZQTVOWm1jWXNDZ1lFQTF5b0wKcExDOHl2Sjk1aFl1dGZlMVdJOXlHS2NpQjl6d1FZRHpBVVVrWHlQZTFYL3p5RnFrVU1ZeXhnQmRJUVEzOW5CUApkYUxtZS83RkZXK29LNXAyMWZCRjBkajZOR3VzYTJmTlZmQ1dubFBCb0hwcDI1emN2Mnl1ckgybDlTZ2I0dVduCk5Dbnk1dTBRV05lVnQvdlh5b0tUejg4OCtsNlZlWjdjZWdSNldYRUNnWUJmQjN3MDRuOGNJME9SUVRnOStxQVQKeU5xb01MZ2NzZkJYNUEwZDI0Tmo5TlFTZFNPVXlOdmhEZDdBN2IzVWZQTVVNVndtWnVsMGhXZE9IdTMrcFRxaApuQSt0eUZIcFJEenZFREtnRFczOXUzWEVQbE1QTzJHRHR6SGtZS1A4YmswRk5zeE1WSThKTVQ3V1pxdFo1ekZKClpTbzBKY0tYVis5M1lDSEw4RU5rSHdLQmdRQ3RiRWM4TS9QSGhGSXpuTmVEZGFlbVBPQlN2SXR5V1FNUldQVUUKcGcwZDNoU2ljdUkwTDlMWEJCa3lmR0tUMVFtaVNYM1NMRDJuM1g1T3U5T0phWk8wOWxmZ1B3blVMS0VwWk40ZApFYkRrNWs5Zm9Lc29CclBxV3BnamtaYXRGZW44Sk94eTRBalhWbVpocFVvWXBCV1hOVTRjSmtaWTZ0bUIwS2lXCmRIdUZFUUtCZ0RvMXQzSGNpdTRuVHgvZjBnVVZTT0dPMTk0TzNnNFRqb29EbDhuRmZUaVlQd09La1A4TzNyOUQKVkpQMHBHcm5oYXVxbEFuSWdIY3B1amx3a3RKQ1BOM1FBVnpFSVhrQXY4ZzFXK0thUjFhQUZmVjNSLzg4VU5BWApFZUVWYlpsc2hUTXcwdkZueWhabFU2OXczbDhFSFdYVlhFaWRUbnBOa1VkM2poU3JvSVhQCi0tLS0tRU5EIFJTQSBQUklWQVRFIEtFWS0tLS0tCg==\n",\n        "context": "minikube"\n    },\n    "kind": "kube"\n}',
      },
    },
    status: "modified",
  },
  {
    resource_id:
      "lsm::LifecycleTransfer[internal,instance_id=5d25ffbe-c59c-4d03-8f7c-000000000005]",
    attributes: {
      next_version: {
        from_value: 7,
        to_value: null,
        from_value_compare: "7",
        to_value_compare: "",
      },
    },
    status: "deleted",
  },
  {
    resource_id:
      "lsm::LifecycleTransfer[internal,instance_id=5d25ffbe-c59c-4d03-8f7c-000000000006]",
    attributes: {
      next_version: {
        from_value: null,
        to_value: 7,
        from_value_compare: "",
        to_value_compare: "7",
      },
    },
    status: "added",
  },
  {
    resource_id:
      "lsm::LifecycleTransfer[internal,instance_id=5d25ffbe-c59c-4d03-8f7c-000000000007]",
    attributes: {
      ip: {
        from_value: null,
        to_value: "192.168.2.97",
        from_value_compare: "",
        to_value_compare: "192.168.2.97",
      },
    },
    status: "added",
  },
  {
    resource_id:
      "lsm::LifecycleTransfer[internal,instance_id=5d25ffbe-c59c-4d03-8f7c-000000000008]",
    attributes: {
      ip: {
        from_value: "192.168.1.91",
        to_value: "192.168.1.92",
        from_value_compare: "192.168.1.91",
        to_value_compare: "192.168.1.92",
      },
      name: {
        from_value: "data-network-internet1-1",
        to_value: "data-network-internet2-1",
        from_value_compare: "data-network-internet1-1",
        to_value_compare: "data-network-internet2-1",
      },
      as_number: {
        from_value: null,
        to_value: 65000,
        from_value_compare: "",
        to_value_compare: "65000",
      },
    },
    status: "modified",
  },
  {
    resource_id:
      "lsm::LifecycleTransfer[internal,instance_id=5d25ffbe-c59c-4d03-8f7c-000000000009]",
    attributes: {},
    status: "unmodified",
  },
  {
    resource_id:
      "lsm::LifecycleTransfer[internal,instance_id=5d25ffbe-c59c-4d03-8f7c-000000000010]",
    attributes: {},
    status: "agent_down",
  },
  {
    resource_id:
      "lsm::LifecycleTransfer[internal,instance_id=5d25ffbe-c59c-4d03-8f7c-000000000011]",
    attributes: {},
    status: "undefined",
  },
  {
    resource_id:
      "lsm::LifecycleTransfer[internal,instance_id=5d25ffbe-c59c-4d03-8f7c-000000000012]",
    attributes: {},
    status: "skipped_for_undefined",
  },
];

export const response = {
  data: resources,
};

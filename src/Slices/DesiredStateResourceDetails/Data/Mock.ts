export const a = {
  resource_id: "nokiasr_eth_cfm::EthCFMState[internal,id=123456]",
  resource_type: "nokiasr_eth_cfm::EthCFMState",
  agent: "internal",
  id_attribute: "id",
  id_attribute_value: "123456",
  attributes: {
    rx_cc: true,
    rxrdi: false,
    domain: "1234",
    if_tlv: "Up",
    purged: false,
    version: 787,
    port_tlv: "Up",
    requires: ["yang::Resource[internal,name=epipe_6789],v=787"],
    send_event: true,
    association: "42",
    credentials: {
      host: "192.168.0.1",
      port: 830,
      password: null,
      username: null,
      password_env_var: "NETCONF_DEVICE_PASSWORD",
      username_env_var: "NETCONF_DEVICE_USER",
    },
    local_mep_id: 1234,
    remote_mep_id: 5678,
    purge_on_delete: false,
    peer_mac_address: "f0:1d:1e:00:2e:54",
    fail_on_incorrect_state: true,
  },
  resource_version_id: "nokiasr_eth_cfm::EthCFMState[internal,id=123456],v=787",
  version: 787,
};

export const response = {
  data: [
    {
      discovered_resource_id: "vcenter::VirtualMachine[lab,name=acisim]",
      managed_resource_uri:
        "/api/v2/resource/cloudflare::dns_record::CnameRecord[https://api.cloudflare.com/client/v4/,name=artifacts.ssh.inmanta.com]",
      discovery_resource_uri:
        "/api/v2/resource/cloudflare::dns_record::CnameRecord[https://api.cloudflare.com/client/v4/,name=artifacts.ssh.inmanta.com]",
      values: {
        name: "acisim",
        path: "/bedc/vm/acisim",
        ports: [
          {
            port_type: "vim.vm.device.VirtualE1000",
            mac_address: "00:50:56:b8:3d:0a",
            pairing_key: "P|dvportgroup-240433",
            network_path: null,
          },
          {
            port_type: "vim.vm.device.VirtualE1000",
            mac_address: "00:50:56:b8:6d:20",
            pairing_key: "P|dvportgroup-240433",
            network_path: null,
          },
        ],
        cpu_num: 12,
        power_on: false,
        memory_mb: 32768,
        auto_start: false,
        hot_add_cpu: false,
        hot_add_memory: false,
        hot_remove_cpu: false,
        iso_cdrom_name: null,
        datastore_paths: ["/bedc/datastore/DatastoreCluster/datastore1"],
        cpu_num_per_socket: 1,
        resource_pool_path: "/bedc/host/lab/Resources",
      },
    },
    {
      discovered_resource_id: "vcenter::VirtualMachine[lab,name=acisim-5.2-7f]",
      managed_resource_uri: null,
      discovery_resource_uri: null,
      values: {
        name: "acisim-5.2-7f",
        path: "/bedc/vm/acisim-5.2-7f",
        ports: [
          {
            port_type: "vim.vm.device.VirtualE1000",
            mac_address: "00:50:56:b8:0d:e5",
            pairing_key: "P|dvportgroup-240433",
            network_path: null,
          },
          {
            port_type: "vim.vm.device.VirtualE1000",
            mac_address: "00:50:56:b8:c7:ba",
            pairing_key: "P|dvportgroup-240433",
            network_path: null,
          },
        ],
        cpu_num: 12,
        power_on: true,
        memory_mb: 32768,
        auto_start: false,
        hot_add_cpu: false,
        hot_add_memory: false,
        hot_remove_cpu: false,
        iso_cdrom_name: null,
        datastore_paths: ["/bedc/datastore/DatastoreCluster/datastore1 (1)"],
        cpu_num_per_socket: 1,
        resource_pool_path: "/bedc/host/lab/Resources",
      },
    },
    {
      discovered_resource_id: "vcenter::VirtualMachine[lab,name=acisim-5.7]",
      managed_resource_uri: "invalid/uri1/",
      discovery_resource_uri: "invalid/uri1/",
      values: {
        name: "acisim-5.7",
        path: "/bedc/vm/acisim-5.7",
        ports: [
          {
            port_type: "vim.vm.device.VirtualE1000",
            mac_address: "00:50:56:b8:a8:dc",
            pairing_key: "P|dvportgroup-240433",
            network_path: null,
          },
          {
            port_type: "vim.vm.device.VirtualE1000",
            mac_address: "00:50:56:b8:78:72",
            pairing_key: "P|dvportgroup-240433",
            network_path: null,
          },
        ],
        cpu_num: 12,
        power_on: true,
        memory_mb: 65536,
        auto_start: false,
        hot_add_cpu: false,
        hot_add_memory: false,
        hot_remove_cpu: false,
        iso_cdrom_name: null,
        datastore_paths: ["/bedc/datastore/DatastoreCluster/datastore1 (1)"],
        cpu_num_per_socket: 1,
        resource_pool_path: "/bedc/host/lab/Resources",
      },
    },
    {
      discovered_resource_id:
        "vcenter::VirtualMachine[lab,name=CentOS7Template]",
      managed_resource_uri: "",
      discovery_resource_uri: "",
      values: {
        name: "CentOS7Template",
        path: "/bedc/vm/CentOS7Template",
        ports: [
          {
            port_type: "vim.vm.device.VirtualVmxnet3",
            mac_address: "00:50:56:b8:db:44",
            pairing_key: "P|dvportgroup-29",
            network_path: null,
          },
        ],
        cpu_num: 1,
        power_on: false,
        memory_mb: 2048,
        auto_start: false,
        hot_add_cpu: true,
        hot_add_memory: true,
        hot_remove_cpu: false,
        iso_cdrom_name: "[datastore1] CentOS-7-x86_64-Minimal-2003.iso",
        datastore_paths: ["/bedc/datastore/DatastoreCluster/datastore1"],
        cpu_num_per_socket: 1,
        resource_pool_path: null,
      },
    },
    {
      discovered_resource_id:
        "vcenter::VirtualMachine[lab,name=CentOS7TestNfvApiTemplate]",
      managed_resource_uri: null,
      discovery_resource_uri: null,
      values: {
        name: "CentOS7TestNfvApiTemplate",
        path: "/bedc/vm/CentOS7TestNfvApiTemplate",
        ports: [
          {
            port_type: "vim.vm.device.VirtualVmxnet3",
            mac_address: "00:50:56:b8:39:97",
            pairing_key: "P|dvportgroup-29",
            network_path: null,
          },
        ],
        cpu_num: 1,
        power_on: false,
        memory_mb: 2048,
        auto_start: false,
        hot_add_cpu: false,
        hot_add_memory: false,
        hot_remove_cpu: false,
        iso_cdrom_name: "[datastore1] CentOS-7-x86_64-Minimal-2003.iso",
        datastore_paths: ["/bedc/datastore/DatastoreCluster/datastore1"],
        cpu_num_per_socket: 1,
        resource_pool_path: null,
      },
    },
    {
      discovered_resource_id:
        "vcenter::VirtualMachine[lab,name=ma-test-1705069110.4363039_1]",
      managed_resource_uri: null,
      discovery_resource_uri: null,
      values: {
        name: "ma-test-1705069110.4363039_1",
        path: "/bedc/vm/test_lab_root_ma/ma-test-1705069110.4363039_1",
        ports: [
          {
            port_type: "vim.vm.device.VirtualVmxnet3",
            mac_address: "00:50:56:b8:59:99",
            pairing_key: "P|dvportgroup-262099",
            network_path: null,
          },
          {
            port_type: "vim.vm.device.VirtualVmxnet3",
            mac_address: "00:50:56:b8:87:3f",
            pairing_key: "P|dvportgroup-262098",
            network_path: null,
          },
        ],
        cpu_num: 1,
        power_on: true,
        memory_mb: 4096,
        auto_start: false,
        hot_add_cpu: true,
        hot_add_memory: true,
        hot_remove_cpu: false,
        iso_cdrom_name: "[datastore1] CentOS-7-x86_64-Minimal-2003.iso",
        datastore_paths: ["/bedc/datastore/DatastoreCluster/datastore1"],
        cpu_num_per_socket: 1,
        resource_pool_path: "/bedc/host/lab/Resources",
      },
    },
    {
      discovered_resource_id: "vcenter::VirtualMachine[lab,name=rocky-8]",
      managed_resource_uri: null,
      discovery_resource_uri: null,
      values: {
        name: "rocky-8",
        path: "/bedc/vm/rocky-8",
        ports: [
          {
            port_type: "vim.vm.device.VirtualVmxnet3",
            mac_address: "00:50:56:b8:55:d5",
            pairing_key: "P|dvportgroup-101557",
            network_path: null,
          },
        ],
        cpu_num: 2,
        power_on: false,
        memory_mb: 2048,
        auto_start: false,
        hot_add_cpu: false,
        hot_add_memory: false,
        hot_remove_cpu: false,
        iso_cdrom_name: "[datastore1] CentOS-8.3.2011-x86_64-boot.iso",
        datastore_paths: ["/bedc/datastore/DatastoreCluster/datastore1"],
        cpu_num_per_socket: 1,
        resource_pool_path: null,
      },
    },
    {
      discovered_resource_id:
        "vcenter::VirtualMachine[lab,name=t160_srv_example]",
      managed_resource_uri: null,
      discovery_resource_uri: null,

      values: {
        name: "t160_srv_example",
        path: "/bedc/vm/test_lab_root/t160_srv_example",
        ports: [],
        cpu_num: 1,
        power_on: false,
        memory_mb: 4096,
        auto_start: false,
        hot_add_cpu: true,
        hot_add_memory: true,
        hot_remove_cpu: false,
        iso_cdrom_name: "[datastore1] CentOS-7-x86_64-Minimal-2003.iso",
        datastore_paths: ["/bedc/datastore/DatastoreCluster/datastore1"],
        cpu_num_per_socket: 1,
        resource_pool_path: "/bedc/host/lab/Resources",
      },
    },
    {
      discovered_resource_id:
        "vcenter::VirtualMachine[lab,name=t160_srv_example_2]",
      managed_resource_uri: null,
      discovery_resource_uri: null,
      values: {
        name: "t160_srv_example_2",
        path: "/bedc/vm/test_lab_root/t160_srv_example_2",
        ports: [],
        cpu_num: 2,
        power_on: false,
        memory_mb: 4096,
        auto_start: false,
        hot_add_cpu: true,
        hot_add_memory: true,
        hot_remove_cpu: false,
        iso_cdrom_name: "[datastore1] CentOS-7-x86_64-Minimal-2003.iso",
        datastore_paths: ["/bedc/datastore/DatastoreCluster/datastore1"],
        cpu_num_per_socket: 2,
        resource_pool_path: "/bedc/host/lab/Resources",
      },
    },
    {
      discovered_resource_id: "vcenter::VirtualMachine[lab,name=test]",
      managed_resource_uri: null,
      discovery_resource_uri: null,
      values: {
        name: "test",
        path: "/bedc/vm/test",
        ports: [
          {
            port_type: "vim.vm.device.VirtualVmxnet3",
            mac_address: "00:50:56:b8:3e:ce",
            pairing_key: "P|dvportgroup-240433",
            network_path: null,
          },
        ],
        cpu_num: 2,
        power_on: false,
        memory_mb: 2048,
        auto_start: false,
        hot_add_cpu: false,
        hot_add_memory: false,
        hot_remove_cpu: false,
        iso_cdrom_name: "[datastore1] CentOS-8.3.2011-x86_64-boot.iso",
        datastore_paths: ["/bedc/datastore/DatastoreCluster/datastore1"],
        cpu_num_per_socket: 1,
        resource_pool_path: "/bedc/host/lab/Resources",
      },
    },
    {
      discovered_resource_id:
        "vcenter::VirtualMachine[lab,name=ubuntu-18.04.6]",
      managed_resource_uri: null,
      discovery_resource_uri: null,
      values: {
        name: "ubuntu-18.04.6",
        path: "/bedc/vm/ubuntu-18.04.6",
        ports: [
          {
            port_type: "vim.vm.device.VirtualVmxnet3",
            mac_address: "00:50:56:b8:0f:76",
            pairing_key: "P|dvportgroup-101560",
            network_path: null,
          },
          {
            port_type: "vim.vm.device.VirtualVmxnet3",
            mac_address: "00:50:56:b8:fc:81",
            pairing_key: "P|dvportgroup-101557",
            network_path: null,
          },
        ],
        cpu_num: 4,
        power_on: false,
        memory_mb: 4096,
        auto_start: false,
        hot_add_cpu: false,
        hot_add_memory: false,
        hot_remove_cpu: false,
        iso_cdrom_name: "[datastore1] ubuntu-18.04.6-live-server-amd64.iso",
        datastore_paths: ["/bedc/datastore/DatastoreCluster/datastore1"],
        cpu_num_per_socket: 1,
        resource_pool_path: null,
      },
    },
    {
      discovered_resource_id: "vcenter::VirtualMachine[lab,name=ubuntu-22.04]",
      managed_resource_uri: null,
      discovery_resource_uri: null,
      values: {
        name: "ubuntu-22.04",
        path: "/bedc/vm/ubuntu-22.04",
        ports: [
          {
            port_type: "vim.vm.device.VirtualVmxnet3",
            mac_address: "00:50:56:b8:6a:02",
            pairing_key: "P|dvportgroup-101557",
            network_path: null,
          },
        ],
        cpu_num: 2,
        power_on: false,
        memory_mb: 4096,
        auto_start: false,
        hot_add_cpu: false,
        hot_add_memory: false,
        hot_remove_cpu: false,
        iso_cdrom_name: "[datastore1] ubuntu-22.04-live-server-amd64.iso",
        datastore_paths: ["/bedc/datastore/DatastoreCluster/datastore1"],
        cpu_num_per_socket: 1,
        resource_pool_path: null,
      },
    },
    {
      discovered_resource_id:
        "vcenter::VirtualMachine[lab,name=vCLS-8d6212c5-a9be-40a9-a99e-f8b563a6f284]",
      managed_resource_uri: null,
      discovery_resource_uri: null,
      values: {
        name: "vCLS-8d6212c5-a9be-40a9-a99e-f8b563a6f284",
        path: "/bedc/vm/vCLS/vCLS-8d6212c5-a9be-40a9-a99e-f8b563a6f284",
        ports: [],
        cpu_num: 1,
        power_on: false,
        memory_mb: 128,
        auto_start: false,
        hot_add_cpu: false,
        hot_add_memory: false,
        hot_remove_cpu: false,
        iso_cdrom_name: null,
        datastore_paths: ["/bedc/datastore/node4-nfs"],
        cpu_num_per_socket: 1,
        resource_pool_path: "/bedc/host/lab/Resources",
      },
    },
    {
      discovered_resource_id:
        "vcenter::VirtualMachine[lab,name=vCLS-a11c52cf-ce5c-438b-a4dc-40ef661f16c3]",
      managed_resource_uri: null,
      discovery_resource_uri: null,
      values: {
        name: "vCLS-a11c52cf-ce5c-438b-a4dc-40ef661f16c3",
        path: "/bedc/vm/vCLS/vCLS-a11c52cf-ce5c-438b-a4dc-40ef661f16c3",
        ports: [],
        cpu_num: 1,
        power_on: true,
        memory_mb: 128,
        auto_start: false,
        hot_add_cpu: false,
        hot_add_memory: false,
        hot_remove_cpu: false,
        iso_cdrom_name: null,
        datastore_paths: ["/bedc/datastore/DatastoreCluster/datastore1 (1)"],
        cpu_num_per_socket: 1,
        resource_pool_path: "/bedc/host/lab/Resources",
      },
    },
    {
      discovered_resource_id:
        "vcenter::VirtualMachine[lab,name=VMware_Cloud_Director-10.5.1.10593-22821417_OVF10]",
      managed_resource_uri: null,
      discovery_resource_uri: null,
      values: {
        name: "VMware_Cloud_Director-10.5.1.10593-22821417_OVF10",
        path: "/bedc/vm/VMware_Cloud_Director-10.5.1.10593-22821417_OVF10",
        ports: [
          {
            port_type: "vim.vm.device.VirtualVmxnet3",
            mac_address: "00:50:56:b8:57:3d",
            pairing_key: "N|network-23",
            network_path: "/bedc/network/VM Network",
          },
          {
            port_type: "vim.vm.device.VirtualVmxnet3",
            mac_address: "00:50:56:b8:b7:6c",
            pairing_key: "N|network-23",
            network_path: "/bedc/network/VM Network",
          },
        ],
        cpu_num: 2,
        power_on: false,
        memory_mb: 12288,
        auto_start: false,
        hot_add_cpu: false,
        hot_add_memory: false,
        hot_remove_cpu: false,
        iso_cdrom_name: null,
        datastore_paths: ["/bedc/datastore/DatastoreCluster/datastore1 (1)"],
        cpu_num_per_socket: 1,
        resource_pool_path: "/bedc/host/lab/Resources",
      },
    },
    {
      discovered_resource_id:
        "vcenter::VirtualMachine[lab,name=VMware vCenter Server 8]",
      managed_resource_uri: null,
      discovery_resource_uri: null,
      values: {
        name: "VMware vCenter Server 8",
        path: "/bedc/vm/Discovered virtual machine/VMware vCenter Server 8",
        ports: [
          {
            port_type: "vim.vm.device.VirtualVmxnet3",
            mac_address: "00:0c:29:aa:c9:e9",
            pairing_key: "N|network-23",
            network_path: "/bedc/network/VM Network",
          },
        ],
        cpu_num: 2,
        power_on: true,
        memory_mb: 14336,
        auto_start: false,
        hot_add_cpu: true,
        hot_add_memory: true,
        hot_remove_cpu: true,
        iso_cdrom_name: null,
        datastore_paths: ["/bedc/datastore/DatastoreCluster/datastore1 (1)"],
        cpu_num_per_socket: 1,
        resource_pool_path: "/bedc/host/lab/Resources",
      },
    },
    {
      discovered_resource_id:
        "vcenter::VirtualMachine[lab,name=WindowsServer2016Template]",
      managed_resource_uri: null,
      discovery_resource_uri: null,
      values: {
        name: "WindowsServer2016Template",
        path: "/bedc/vm/WindowsServer2016Template",
        ports: [
          {
            port_type: "vim.vm.device.VirtualE1000e",
            mac_address: "00:50:56:b8:43:7b",
            pairing_key: "P|dvportgroup-29",
            network_path: null,
          },
        ],
        cpu_num: 2,
        power_on: false,
        memory_mb: 4096,
        auto_start: false,
        hot_add_cpu: true,
        hot_add_memory: true,
        hot_remove_cpu: false,
        iso_cdrom_name:
          "[datastore1] Windows_Server_2016_Datacenter_EVAL_en-us_14393_refresh.ISO",
        datastore_paths: ["/bedc/datastore/DatastoreCluster/datastore1"],
        cpu_num_per_socket: 2,
        resource_pool_path: null,
      },
    },
  ],
  links: {
    self: "/api/v2/discovered?limit=20&sort=discovered_resource_id.asc",
  },
  metadata: {
    total: 17,
    before: 0,
    after: 0,
    page_size: 20,
  },
};

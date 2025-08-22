import { InstanceAttributeModel } from "@/Core";
import { getEntityAttributes } from "./getEntityFromAttributes";

describe("getEntityAttributes", () => {
    it("should return InstanceAttributeModel for valid nested router config", () => {
        const attributes: InstanceAttributeModel = {
            vlan_assignment_r1: {
                address: "192.168.1.10/24",
                vlan_id: 100,
                router_ip: "192.168.1.1",
                interface_name: "eth0",
            },
            service_name: "core-router-service",
        };

        const result = getEntityAttributes("vlan_assignment_r1", attributes);

        expect(result).toEqual({
            address: "192.168.1.10/24",
            vlan_id: 100,
            router_ip: "192.168.1.1",
            interface_name: "eth0",
        });
    });

    it("should return array of InstanceAttributeModel for valid network interfaces array", () => {
        const attributes: InstanceAttributeModel = {
            network_interfaces: [
                { name: "eth0", ip_address: "10.0.1.5/24", vlan_id: 100 },
                { name: "eth1", ip_address: "10.0.2.5/24", vlan_id: 200 },
            ],
            router_name: "edge-router-01",
        };

        const result = getEntityAttributes("network_interfaces", attributes);

        expect(result).toEqual([
            { name: "eth0", ip_address: "10.0.1.5/24", vlan_id: 100 },
            { name: "eth1", ip_address: "10.0.2.5/24", vlan_id: 200 },
        ]);
    });

    it("should return null for primitive values", () => {
        const attributes: InstanceAttributeModel = {
            router_name: "edge-router-01",
            vlan_id: 100,
            should_deploy_fail: false,
        };

        expect(getEntityAttributes("router_name", attributes)).toBeNull();
        expect(getEntityAttributes("vlan_id", attributes)).toBeNull();
        expect(getEntityAttributes("should_deploy_fail", attributes)).toBeNull();
    });

    it("should return null for arrays of primitives", () => {
        const attributes: InstanceAttributeModel = {
            dns_servers: ["8.8.8.8", "8.8.4.4"],
            vlan_ids: [100, 200, 300],
        };

        expect(getEntityAttributes("dns_servers", attributes)).toBeNull();
        expect(getEntityAttributes("vlan_ids", attributes)).toBeNull();
    });

    it("should return null for mixed arrays or non-existent keys", () => {
        const attributes: InstanceAttributeModel = {
            mixed_array: [{ name: "eth0" }, "invalid", { name: "eth1" }],
            array_with_nulls: [{ vlan: 100 }, null, { vlan: 200 }],
        };

        expect(getEntityAttributes("mixed_array", attributes)).toBeNull();
        expect(getEntityAttributes("array_with_nulls", attributes)).toBeNull();
        expect(getEntityAttributes("non_existent", attributes)).toBeNull();
    });

    it("should handle empty objects and arrays", () => {
        const attributes: InstanceAttributeModel = {
            empty_config: {},
            empty_interfaces: [],
        };

        expect(getEntityAttributes("empty_config", attributes)).toEqual({});
        expect(getEntityAttributes("empty_interfaces", attributes)).toEqual([]);
    });
});

import { sendOrder } from "./orderRequest";

describe("orderRequest", () => {
  it("properly compose request to the backend", () => {
    global.fetch = jest.fn();
    sendOrder("test_url", "env_id", [
      {
        instance_id: "1234",
        config: {},
        action: "create",
        service_entity: "test",
      },
    ]);
    expect(fetch).toHaveBeenCalledWith("test_url/lsm/v2/order", {
      body: '{"service_order_items":[{"instance_id":"1234","config":{},"action":"create","service_entity":"test"}],"description":"Requested with Instance Composer"}',
      headers: {
        "Content-Type": "application/json",
        "X-Inmanta-tid": "env_id",
      },
      method: "POST",
    });
  });
});

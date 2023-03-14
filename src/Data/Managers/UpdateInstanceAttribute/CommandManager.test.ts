import { ServiceInstance } from "@/Test";
import { getBody } from "./CommandManager";

test("GIVEN getBody THEN generates correct body with message", async () => {
  expect(
    getBody(
      "inmanta",
      "active_attributes",
      "test",
      "test_target",
      ServiceInstance.a.version,
      ServiceInstance.a.service_entity,
      ServiceInstance.a.id
    )
  ).toEqual({
    patch_id:
      ServiceInstance.a.service_entity +
      "-update-" +
      ServiceInstance.a.id +
      "-" +
      ServiceInstance.a.version,
    attribute_set_name: "active_attributes",
    edit: [
      {
        edit_id:
          ServiceInstance.a.service_entity +
          "-test_target-update-" +
          ServiceInstance.a.id +
          "-" +
          ServiceInstance.a.version,
        operation: "replace",
        target: "test_target",
        value: "test",
      },
    ],
    current_version: ServiceInstance.a.version,
    comment: "Triggered from the console by inmanta",
  });
});

import { ServiceInstance } from "@/Test";
import { getBody } from "./CommandManager";

test("GIVEN getBody THEN generates correct body with message", async () => {
  expect(getBody("inmanta", "up", ServiceInstance.a.version)).toEqual({
    current_version: ServiceInstance.a.version,
    target_state: "up",
    message: "Triggered from the console by inmanta",
  });
});

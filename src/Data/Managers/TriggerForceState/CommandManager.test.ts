import { ServiceInstance } from "@/Test";
import { composeCommandBody } from "./CommandManager";

test("GIVEN getBody THEN generates correct body with message", async () => {
  expect(
    composeCommandBody("inmanta", "up", ServiceInstance.a.version)
  ).toEqual({
    current_version: ServiceInstance.a.version,
    target_state: "up",
    message: "Triggered from the console by inmanta",
  });
});

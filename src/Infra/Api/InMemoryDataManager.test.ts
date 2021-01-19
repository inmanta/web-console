import { InMemoryDataManager } from "./InMemoryDataManager";

test("InMemoryDataManager", async () => {
  const manager = new InMemoryDataManager();
  const instances = await manager.getInstancesForService("test");
  expect(instances).toMatchObject({});
});

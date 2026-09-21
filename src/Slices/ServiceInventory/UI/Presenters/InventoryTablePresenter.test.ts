import { Service, ServiceInstance } from "@/Test";
import { createInventoryTablePresenter } from "./InventoryTablePresenter";

test("createRows shortens each instance id to a 4 character short id", () => {
  const rows = createInventoryTablePresenter().createRows([ServiceInstance.a], Service.a);

  expect(rows[0].id.short.length).toBe(4);
});

describe("with a service identity", () => {
  const presenter = createInventoryTablePresenter("service_id", "Service ID");

  test("uses the identity as the first column and makes it sortable", () => {
    expect(presenter.shouldUseServiceIdentity()).toBe(true);
    expect(presenter.getIdColumnApiName()).toBe("service_id");
    expect(presenter.getIdColumnName()).toBe("Service ID");
    expect(presenter.getColumnHeads()[0].apiName).toBe("service_id");
    expect(presenter.getSortableColumnNames()).toContain("service_id");
  });
});

describe("without a service identity", () => {
  const presenter = createInventoryTablePresenter();

  test("falls back to the default id column and no identity sorting", () => {
    expect(presenter.shouldUseServiceIdentity()).toBe(false);
    expect(presenter.getIdColumnApiName()).toBe("id");
    expect(presenter.getSortableColumnNames()).not.toContain("service_id");
  });
});

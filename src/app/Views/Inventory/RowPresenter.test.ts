import { RowPresenter } from "./RowPresenter";
import { instance } from "@app/fixtures";
import { DummyDatePresenter } from "./DummyDatePresenter";

const presenter = new RowPresenter(new DummyDatePresenter());
const rows = presenter.createFromInstances([instance]);

test("RowPresenter short id", () => {
  expect(rows[0].id.length).toBe(4);
});

test("RowPresenter full date", () => {
  expect(rows[0].createdAt.full).toMatch("full");
});

test("RowPresenter relative date", () => {
  expect(rows[0].createdAt.relative).toMatch("relative");
});

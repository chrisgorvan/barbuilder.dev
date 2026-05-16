import { describe, it, expect } from "vitest";
import { generateXofY } from "../../../src/generators/xofy.js";
import { makeConfig } from "../test-helpers.js";

describe("generateXofY", () => {
  it("calculates value as a percentage of total", () => {
    const result = generateXofY(
      makeConfig({ type: "xofy", current: 3, total: 10 }),
    );
    expect(result.value).toBe(30);
  });

  it("caps current at total without erroring", () => {
    const result = generateXofY(
      makeConfig({ type: "xofy", current: 999, total: 10 }),
    );
    expect(result.value).toBe(100);
  });

  it("treats missing current as 0", () => {
    const result = generateXofY(makeConfig({ type: "xofy", total: 10 }));
    expect(result.value).toBe(0);
  });

  it("defaults total to 100 when missing", () => {
    const result = generateXofY(makeConfig({ type: "xofy", current: 25 }));
    expect(result.value).toBe(25);
  });

  it("auto-labels as 'Progress' when no label", () => {
    const result = generateXofY(
      makeConfig({ type: "xofy", current: 1, total: 5, label: "" }),
    );
    expect(result.label).toBe("Progress");
  });

  it("preserves explicit label", () => {
    const result = generateXofY(
      makeConfig({ type: "xofy", current: 1, total: 5, label: "Tasks" }),
    );
    expect(result.label).toBe("Tasks");
  });

  it("for segments style, sets segments to total", () => {
    const result = generateXofY(
      makeConfig({ type: "xofy", style: "segments", current: 4, total: 7 }),
    );
    expect(result.segments).toBe(7);
  });

  it("for segments style, clamps total below 2 up to 2", () => {
    const result = generateXofY(
      makeConfig({ type: "xofy", style: "segments", current: 0, total: 1 }),
    );
    expect(result.segments).toBe(2);
  });

  it("for segments style, clamps total above 20 down to 20", () => {
    const result = generateXofY(
      makeConfig({ type: "xofy", style: "segments", current: 0, total: 50 }),
    );
    expect(result.segments).toBe(20);
  });

  it("for non-segments styles, does not touch segments", () => {
    const result = generateXofY(
      makeConfig({
        type: "xofy",
        style: "classic",
        current: 5,
        total: 10,
        segments: 99,
      }),
    );
    expect(result.segments).toBe(99);
  });

  it("zero total guarded by default fallback (no NaN)", () => {
    const result = generateXofY(
      makeConfig({ type: "xofy", current: 0, total: 0 }),
    );
    // total falsy → defaults to 100, value = 0/100 = 0
    expect(result.value).toBe(0);
    expect(Number.isFinite(result.value)).toBe(true);
  });
});

import { describe, it, expect } from "vitest";
import { generateIcon } from "../../../src/generators/icon.js";
import { makeConfig } from "../test-helpers.js";

describe("generateIcon", () => {
  it("calculates value as a percentage of total", () => {
    const result = generateIcon(
      makeConfig({ type: "icon", current: 4, total: 5 }),
    );
    expect(result.value).toBe(80);
  });

  it("caps current at total but preserves total", () => {
    const result = generateIcon(
      makeConfig({ type: "icon", current: 99, total: 5 }),
    );
    expect(result.current).toBe(5);
    expect(result.total).toBe(5);
    expect(result.value).toBe(100);
  });

  it("preserves decimal current values for half-fill", () => {
    const result = generateIcon(
      makeConfig({ type: "icon", current: 3.5, total: 5 }),
    );
    expect(result.current).toBe(3.5);
    expect(result.value).toBe(70);
  });

  it("defaults total to 5 when missing", () => {
    const result = generateIcon(makeConfig({ type: "icon", current: 2 }));
    expect(result.total).toBe(5);
    expect(result.value).toBe(40);
  });

  it("defaults shape to 'star' when not provided", () => {
    const result = generateIcon(
      makeConfig({ type: "icon", current: 1, total: 3 }),
    );
    expect(result.shape).toBe("star");
  });

  it("preserves explicit shape", () => {
    const result = generateIcon(
      makeConfig({ type: "icon", current: 1, total: 3, shape: "heart" }),
    );
    expect(result.shape).toBe("heart");
  });

  it("does not auto-generate a label", () => {
    const result = generateIcon(
      makeConfig({ type: "icon", current: 1, total: 3, label: "" }),
    );
    expect(result.label).toBe("");
  });

  it("preserves explicit label if provided", () => {
    const result = generateIcon(
      makeConfig({ type: "icon", current: 1, total: 3, label: "Rating" }),
    );
    expect(result.label).toBe("Rating");
  });
});

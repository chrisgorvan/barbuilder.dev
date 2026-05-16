import { describe, it, expect } from "vitest";
import { renderBadge } from "../../../src/styles/badge.js";
import { makeConfig } from "../test-helpers.js";

describe("renderBadge", () => {
  it("renders an X% value for percentage type", () => {
    const svg = renderBadge(
      makeConfig({ type: "percentage", value: 73, label: "Build" }),
    );
    expect(svg).toContain("Build");
    expect(svg).toContain("73%");
  });

  it("rounds percentage value to nearest integer", () => {
    const svg = renderBadge(
      makeConfig({ type: "percentage", value: 73.7, label: "x" }),
    );
    expect(svg).toContain("74%");
  });

  it("renders X/Y for xofy type", () => {
    const svg = renderBadge(
      makeConfig({
        type: "xofy",
        value: 50,
        current: 3,
        total: 6,
        label: "Tasks",
      }),
    );
    expect(svg).toContain("3/6");
  });

  it("caps current at total in xofy badge text", () => {
    const svg = renderBadge(
      makeConfig({
        type: "xofy",
        value: 100,
        current: 99,
        total: 5,
        label: "x",
      }),
    );
    expect(svg).toContain("5/5");
    expect(svg).not.toContain("99/5");
  });

  it("renders X/Y for icon type", () => {
    const svg = renderBadge(
      makeConfig({
        type: "icon",
        value: 80,
        current: 4,
        total: 5,
        label: "Stars",
      }),
    );
    expect(svg).toContain("4/5");
  });

  it("uses the colour for the value section background", () => {
    const svg = renderBadge(
      makeConfig({
        type: "percentage",
        value: 50,
        label: "x",
        color: "#1234aa",
      }),
    );
    expect(svg).toContain('fill="#1234aa"');
  });

  it("uses #555555 for the label section background", () => {
    const svg = renderBadge(
      makeConfig({ type: "percentage", value: 50, label: "x" }),
    );
    expect(svg).toContain('fill="#555555"');
  });

  it("emits two text elements (label + value)", () => {
    const svg = renderBadge(
      makeConfig({ type: "percentage", value: 50, label: "Build" }),
    );
    const matches = svg.match(/<text[^>]*>/g) ?? [];
    expect(matches.length).toBe(2);
  });

  it("supports gradient mode for the value section", () => {
    const svg = renderBadge(
      makeConfig({
        type: "percentage",
        value: 50,
        label: "x",
        colorMode: "gradient",
        colorFrom: "#ff0000",
        colorTo: "#00ff00",
      }),
    );
    expect(svg).toContain("<linearGradient");
  });
});

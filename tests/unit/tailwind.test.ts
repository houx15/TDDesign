import { describe, it, expect } from "vitest";
import { resolveTailwindClass } from "../../tddesign/parser/tailwind.js";

describe("tailwind resolver", () => {
  it("resolves arbitrary-value background color to the hex", () => {
    expect(resolveTailwindClass("bg-[#0F0F10]")).toEqual({
      property: "background-color",
      value: "#0F0F10",
    });
  });

  it("resolves arbitrary-value text color", () => {
    expect(resolveTailwindClass("text-[#FAFAFA]")).toEqual({
      property: "color",
      value: "#FAFAFA",
    });
  });

  it("resolves py-20 to 80px vertical padding", () => {
    expect(resolveTailwindClass("py-20")).toEqual({
      property: "padding-block",
      value: "80px",
    });
  });

  it("resolves py-4 to 16px vertical padding", () => {
    expect(resolveTailwindClass("py-4")).toEqual({
      property: "padding-block",
      value: "16px",
    });
  });

  it("resolves px-8 to 32px horizontal padding", () => {
    expect(resolveTailwindClass("px-8")).toEqual({
      property: "padding-inline",
      value: "32px",
    });
  });

  it("resolves px-6 to 24px horizontal padding", () => {
    expect(resolveTailwindClass("px-6")).toEqual({
      property: "padding-inline",
      value: "24px",
    });
  });

  it("resolves rounded-lg to 0.5rem border-radius", () => {
    expect(resolveTailwindClass("rounded-lg")).toEqual({
      property: "border-radius",
      value: "0.5rem",
    });
  });

  it("returns null for unrecognized tokens", () => {
    expect(resolveTailwindClass("completely-made-up")).toBeNull();
  });

  it("returns null for unknown spacing scale", () => {
    expect(resolveTailwindClass("py-9999")).toBeNull();
  });
});

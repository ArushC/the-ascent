import { describe, expect, it } from "vitest";
import {
  DEFAULT_PLATFORM_HEIGHT,
  DEFAULT_PLATFORM_WIDTH,
} from "../platform/Platform";
import { createStaticPlatform } from "./StaticPlatform";

describe("createStaticPlatform", () => {
  it("uses default dimensions and flags", () => {
    expect(createStaticPlatform(12, 34)).toMatchObject({
      kind: "static",
      x: 12,
      y: 34,
      width: DEFAULT_PLATFORM_WIDTH,
      height: DEFAULT_PLATFORM_HEIGHT,
      hasSpring: false,
      springActivationMs: 0,
      hasPowerup: false,
    });
  });

  it("passes optional spring and powerup flags through", () => {
    expect(createStaticPlatform(12, 34, true, true)).toMatchObject({
      hasSpring: true,
      hasPowerup: true,
    });
  });
});

import { describe, expect, it } from "vitest";
import {
  SPRING_ACTIVATION_DURATION_MS,
  SPRING_ACTIVE_COLOR,
  SPRING_BURST_MAX_INSET,
  SPRING_COMPRESSED_HEIGHT,
  SPRING_HEIGHT,
  SPRING_PLATFORM_FLASH_MAX_ALPHA,
  SPRING_REST_COLOR,
  getSpringActivationVisuals,
} from "./Spring";
import { createTestStaticPlatform } from "../testing/entityFactories";

describe("getSpringActivationVisuals", () => {
  it("uses the resting spring style when inactive", () => {
    const platform = createTestStaticPlatform({ hasSpring: true });

    expect(getSpringActivationVisuals(platform)).toEqual({
      isActive: false,
      activationRatio: 0,
      springColor: SPRING_REST_COLOR,
      springHeight: SPRING_HEIGHT,
      platformFlashAlpha: 0,
      burstInset: SPRING_BURST_MAX_INSET,
    });
  });

  it("uses the fully activated style at the start of activation", () => {
    const platform = createTestStaticPlatform({ hasSpring: true });
    platform.springActivationMs = SPRING_ACTIVATION_DURATION_MS;

    expect(getSpringActivationVisuals(platform)).toEqual({
      isActive: true,
      activationRatio: 1,
      springColor: SPRING_ACTIVE_COLOR,
      springHeight: SPRING_COMPRESSED_HEIGHT,
      platformFlashAlpha: SPRING_PLATFORM_FLASH_MAX_ALPHA,
      burstInset: 0,
    });
  });

  it("interpolates the visual cue while activation decays", () => {
    const platform = createTestStaticPlatform({ hasSpring: true });
    platform.springActivationMs = SPRING_ACTIVATION_DURATION_MS / 2;

    expect(getSpringActivationVisuals(platform)).toEqual({
      isActive: true,
      activationRatio: 0.5,
      springColor: SPRING_ACTIVE_COLOR,
      springHeight: (SPRING_HEIGHT + SPRING_COMPRESSED_HEIGHT) / 2,
      platformFlashAlpha: SPRING_PLATFORM_FLASH_MAX_ALPHA / 2,
      burstInset: SPRING_BURST_MAX_INSET / 2,
    });
  });
});

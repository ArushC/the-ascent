You are my test engineer.

Generate unit tests for this game system.

System under test:
{{SYSTEM}}

Source file:
{{SOURCE_FILE}}

Behavior / requirements:
{{REQUIREMENTS}}

Known edge cases:
{{EDGE_CASES}}

Project context:
- Vertical endless climber in React, TypeScript, and Canvas
- Vitest test runner
- Unit tests live next to the source file they cover
- Test pure logic only; no canvas, no requestAnimationFrame, no React

Rules:
- Use Vitest (describe, it, expect)
- Keep tests focused and readable
- One behavior per test
- Use a test helper to construct Player/Platform entities; do not require HTMLCanvasElement
- Import constants from the system under test
- Do not add dependencies
- Do not test rendering or DOM event listeners unless explicitly asked

After writing tests, provide:

1. Files created/changed
2. What each test verifies
3. Edge cases covered vs. deferred
4. How to run the tests

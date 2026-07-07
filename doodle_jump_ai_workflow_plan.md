# Doodle Jump AI Workflow Practice Plan

## Goal

Build a Doodle Jump-style browser game while deliberately practicing modern AI-assisted engineering workflows.

This is not just a game project. Treat it as a structured experiment in using AI tools to ship software faster while staying responsible for architecture, correctness, testing, and final decisions.

By the end, you should have:

1. A working Doodle Jump clone.
2. A GitHub repository with clean commits.
3. A written record of how you used different AI tools.
4. Concrete interview stories about planning, implementation, debugging, testing, refactoring, and model comparison.

---

# 0. Recommended Stack

Use this stack unless you have a strong reason not to:

- **Frontend:** React + TypeScript
- **Rendering:** HTML5 Canvas
- **Build tool:** Vite
- **Package manager:** npm
- **Testing:** Vitest
- **E2E testing:** Playwright
- **Version control:** Git + GitHub
- **AI tools:** ChatGPT, Codex, Claude, Claude Code, Cursor or VS Code Copilot, optionally Gemini

Why this stack:

- React + TypeScript is familiar and interview-friendly.
- Canvas forces you to understand the game loop yourself.
- Vite is simple and fast.
- Vitest works naturally with Vite.
- Playwright lets you test the game in a browser.

---

# 1. Local Machine Setup

## 1.1 Install Node.js

Check whether Node is installed:

```bash
node -v
npm -v
```

If not installed, install Node.js LTS from:

```text
https://nodejs.org/
```

Recommended version:

```text
Node 20+
```

Verify again:

```bash
node -v
npm -v
```

---

## 1.2 Install Git

Check whether Git is installed:

```bash
git --version
```

If not installed, install it from:

```text
https://git-scm.com/downloads
```

Configure Git identity:

```bash
git config --global user.name "Your Name"
git config --global user.email "your.email@example.com"
```

Verify:

```bash
git config --global --list
```

---

## 1.3 Create a Root Projects Folder

Pick a root directory where your projects live.

Example:

```bash
mkdir -p ~/code
cd ~/code
```

Create the project:

```bash
npm create vite@latest doodle-jump-ai -- --template react-ts
cd doodle-jump-ai
npm install
```

Run the app:

```bash
npm run dev
```

Open the local URL that Vite prints, usually:

```text
http://localhost:5173
```

You should see the default Vite React page.

---

# 2. GitHub Repository Setup

## 2.1 Initialize Git Locally

From inside the project folder:

```bash
git init
git status
```

Create a `.gitignore` if Vite did not already create one:

```bash
touch .gitignore
```

Recommended `.gitignore`:

```gitignore
node_modules
dist
.env
.env.local
.DS_Store
coverage
playwright-report
test-results
```

Make the first commit:

```bash
git add .
git commit -m "Initialize React TypeScript Vite project"
```

---

## 2.2 Create the GitHub Repository Using the Website

1. Go to GitHub.
2. Click **New repository**.
3. Repository name:

```text
doodle-jump-ai
```

4. Visibility: public or private.
5. Do **not** initialize with README, `.gitignore`, or license if you already created files locally.
6. Click **Create repository**.

GitHub will show commands like this:

```bash
git remote add origin git@github.com:YOUR_USERNAME/doodle-jump-ai.git
git branch -M main
git push -u origin main
```

Run those locally.

---

## 2.3 GitHub Authentication Options

### Option A: SSH, recommended

Check for existing SSH keys:

```bash
ls ~/.ssh
```

If you do not have a key, create one:

```bash
ssh-keygen -t ed25519 -C "your.email@example.com"
```

Press Enter through the prompts unless you want a custom path.

Start SSH agent:

```bash
eval "$(ssh-agent -s)"
ssh-add ~/.ssh/id_ed25519
```

Copy your public key:

```bash
cat ~/.ssh/id_ed25519.pub
```

Then:

1. Go to GitHub.
2. Settings.
3. SSH and GPG keys.
4. New SSH key.
5. Paste the public key.

Test:

```bash
ssh -T git@github.com
```

Expected result: GitHub recognizes your username.

### Option B: HTTPS + Personal Access Token

Use this if SSH is annoying.

1. GitHub Settings.
2. Developer settings.
3. Personal access tokens.
4. Generate token.
5. Give it repo access.
6. Use the token as your password when pushing over HTTPS.

Do not commit tokens into the repo.

---

# 3. Clean Initial Project Structure

Replace the default Vite structure with something game-specific.

From project root:

```bash
mkdir -p src/game
mkdir -p src/game/entities
mkdir -p src/game/systems
mkdir -p src/game/rendering
mkdir -p src/game/input
mkdir -p src/game/config
mkdir -p docs
mkdir -p prompts
```

Suggested structure:

```text
doodle-jump-ai/
  docs/
    PLAN.md
    AI_NOTES.md
    ARCHITECTURE.md
    INTERVIEW_STORIES.md
  prompts/
    01-product-spec.md
    02-architecture-review.md
    03-code-review.md
    04-debugging.md
    05-testing.md
  src/
    game/
      config/
        constants.ts
      entities/
        Player.ts
        Platform.ts
      input/
        KeyboardInput.ts
      rendering/
        CanvasRenderer.ts
      systems/
        PhysicsSystem.ts
        CollisionSystem.ts
        PlatformSpawner.ts
        CameraSystem.ts
        ScoreSystem.ts
      Game.ts
      types.ts
    App.tsx
    main.tsx
```

Create the docs files:

```bash
touch docs/PLAN.md docs/AI_NOTES.md docs/ARCHITECTURE.md docs/INTERVIEW_STORIES.md
```

Create prompt files:

```bash
touch prompts/01-product-spec.md

touch prompts/02-architecture-review.md

touch prompts/03-code-review.md

touch prompts/04-debugging.md

touch prompts/05-testing.md
```

Commit:

```bash
git add .
git commit -m "Add project structure and documentation files"
```

---

# 4. First Canvas Setup

## 4.1 Replace `src/App.tsx`

Create a minimal Canvas app.

```tsx
import { useEffect, useRef } from "react";
import "./App.css";

function App() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    ctx.fillStyle = "black";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.fillStyle = "white";
    ctx.font = "24px sans-serif";
    ctx.fillText("Doodle Jump AI", 100, 100);
  }, []);

  return (
    <main>
      <canvas ref={canvasRef} width={400} height={600} />
    </main>
  );
}

export default App;
```

## 4.2 Replace `src/App.css`

```css
body {
  margin: 0;
  min-width: 320px;
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #111;
}

main {
  display: flex;
  align-items: center;
  justify-content: center;
}

canvas {
  border: 2px solid white;
  background: black;
}
```

Run:

```bash
npm run dev
```

Confirm that the browser shows a black canvas with white text.

Commit:

```bash
git add .
git commit -m "Render initial game canvas"
```

---

# 5. AI Tool Setup

You do not need every tool on day one. Start with ChatGPT + Codex or Claude, then add others.

---

## 5.1 ChatGPT Workflow

Use ChatGPT for:

- Product decomposition
- Architecture discussion
- Debugging explanations
- Interview story refinement
- Reviewing tradeoffs

Suggested usage:

1. Open ChatGPT in browser.
2. Start a dedicated project conversation called:

```text
Doodle Jump AI Workflow
```

3. Paste the project goal:

```text
I am building a Doodle Jump clone in React + TypeScript + Canvas. The real goal is to practice AI-assisted software engineering workflows for interviews. Help me use AI as a tech lead, code reviewer, debugger, test engineer, and interview coach. I want to maintain ownership of architecture and final decisions.
```

Save reusable prompts in `prompts/`.

---

## 5.2 Codex Workflow

Use Codex for:

- Implementing multi-file features
- Making coordinated edits
- Adding tests
- Fixing known bugs
- Refactoring after you define the target

Recommended pattern:

1. Create an issue or TODO in plain English.
2. Ask Codex to implement the smallest possible feature.
3. Review the diff manually.
4. Run the app and tests.
5. Commit only after you understand the change.

Example Codex task:

```text
Implement basic player physics for the Doodle Jump game.

Requirements:
- Add a Player entity with x, y, width, height, velocityX, velocityY.
- Add gravity.
- Add horizontal keyboard movement.
- Add jump impulse when landing on a platform later, but for now allow an initial upward velocity so movement is visible.
- Keep rendering through Canvas.
- Keep code modular.
- Do not add unnecessary libraries.
```

After Codex produces a diff, ask:

```text
Explain the changes file by file. Identify any assumptions or risks.
```

Then manually inspect the diff.

---

## 5.3 Claude Web Workflow

Use Claude in browser for:

- Alternative architecture suggestions
- Reviewing larger chunks of code
- Comparing design approaches
- Explaining bugs
- Refactoring suggestions

Suggested first Claude prompt:

```text
I am building a Doodle Jump clone in React + TypeScript + Canvas. I want you to act as a senior engineer reviewing my architecture. Do not write code yet. Tell me what systems I should create, what state each owns, and what bugs I should watch out for.
```

Use Claude as a second opinion after ChatGPT or Codex.

---

## 5.4 Claude Code Setup

Claude Code is useful when you want Claude operating directly inside your codebase.

Install instructions may change, so use the official Anthropic instructions for your machine. The general workflow is:

```bash
cd ~/code/doodle-jump-ai
claude
```

Then ask it repo-aware questions like:

```text
Read this codebase and summarize the architecture. Do not make changes yet.
```

Then:

```text
Refactor the collision system for readability without changing behavior. Keep the diff small.
```

Recommended Claude Code rules:

- Always ask it to explain before editing.
- Always review the diff.
- Keep edits scoped.
- Commit before large refactors so you can revert easily.

Good Claude Code prompts:

```text
Inspect the current game architecture. What are the highest-risk files and why?
```

```text
Find duplicated logic between physics, camera, and rendering. Suggest a refactor plan but do not edit yet.
```

```text
Implement the smallest safe refactor from your plan. Do not change behavior.
```

---

## 5.5 Cursor Setup

Cursor is useful if you want an AI-native editor.

Basic setup:

1. Install Cursor.
2. Open the project folder:

```text
~/code/doodle-jump-ai
```

3. Sign in.
4. Configure your preferred model if needed.
5. Use chat or composer mode for repo-wide edits.

Recommended Cursor workflow:

- Select a file or folder.
- Ask for a small feature.
- Review the generated diff.
- Accept only the parts you understand.

Example Cursor prompt:

```text
Add keyboard input handling for left/right movement. Keep input state separate from Player. Do not modify rendering except where necessary.
```

---

## 5.6 GitHub Copilot Setup

Use Copilot for:

- Autocomplete
- Small helper functions
- Boilerplate
- Type definitions

Setup:

1. Install VS Code.
2. Install GitHub Copilot extension.
3. Sign in with GitHub.
4. Open project folder.

Recommended Copilot usage:

- Let it autocomplete obvious code.
- Do not let it silently create architecture.
- Use it for speed, not decisions.

Good use cases:

```text
interface Player
```

```text
function rectanglesOverlap(...)
```

```text
const GAME_WIDTH = 400
```

---

## 5.7 Gemini Workflow

Use Gemini as a comparison model.

Good tasks for Gemini:

- Ask for an alternate implementation.
- Ask for performance risks.
- Ask for test cases.

Example:

```text
Here is my platform spawning algorithm. Suggest edge cases and simpler alternatives. Do not rewrite the whole project.
```

---

# 6. Optional MCP Setup

MCP stands for Model Context Protocol. It allows AI tools to connect to external tools or data sources through standardized servers.

You do not need MCP to start. Add it only after the base game works.

Good MCP experiments for this project:

- Filesystem access
- GitHub issue access
- Browser automation
- Playwright test integration

## 6.1 MCP Experiment Goal

Use MCP to let an AI assistant interact with the project more like an engineering agent.

Example target workflow:

```text
AI reads GitHub issue -> edits code -> runs tests -> summarizes diff -> suggests commit message.
```

## 6.2 Recommended MCP Safety Rules

- Never give broad write access unless you trust the setup.
- Keep the repo under Git before using MCP.
- Commit before agentic experiments.
- Do not expose secrets.
- Keep `.env` ignored.

## 6.3 MCP Documentation File

Create:

```bash
touch docs/MCP_EXPERIMENTS.md
```

Template:

```md
# MCP Experiments

## Experiment 1: Filesystem MCP

Goal:

Setup:

Prompt used:

What worked:

What failed:

Safety concern:

Would I use this in real engineering work?
```

Commit:

```bash
git add .
git commit -m "Add MCP experiment documentation"
```

---

# 7. Core Development Milestones

Each milestone should be independently testable and committed separately.

---

## Milestone 1: Static Canvas

Goal:

- Browser shows game canvas.
- Canvas renders text or a rectangle.

Files likely touched:

```text
src/App.tsx
src/App.css
```

AI workflow:

- Use little to no AI.
- This is baseline setup.

Commit:

```bash
git commit -m "Render initial game canvas"
```

---

## Milestone 2: Game Loop

Goal:

- Add `requestAnimationFrame` loop.
- Separate update and render phases.
- Track delta time.

Files to create:

```text
src/game/Game.ts
src/game/types.ts
src/game/config/constants.ts
```

Prompt:

```text
Design a minimal game loop for a React + TypeScript + Canvas game. Use requestAnimationFrame, separate update and render, and track delta time. Do not over-engineer it.
```

Implementation prompt for Codex / Claude Code:

```text
Implement a minimal Game class with start(), stop(), update(deltaTime), and render(). Wire it into App.tsx using a canvas ref. Keep the diff small.
```

Manual test:

- Open browser.
- Confirm canvas still renders.
- Add a moving rectangle to verify animation.

Commit:

```bash
git add .
git commit -m "Add game loop"
```

---

## Milestone 3: Player Entity and Gravity

Goal:

- Add player position.
- Add vertical velocity.
- Apply gravity.
- Render player rectangle.

Files to create:

```text
src/game/entities/Player.ts
src/game/systems/PhysicsSystem.ts
```

Prompt:

```text
Design the player physics for a Doodle Jump clone. Explain position, velocity, gravity, jump impulse, and delta time. Do not write code yet.
```

Implementation prompt:

```text
Implement Player and PhysicsSystem. The player should start near the bottom of the canvas, move upward with an initial jump velocity, then fall under gravity. Render the player as a rectangle for now.
```

Manual test:

- Player moves upward.
- Player slows down.
- Player falls.

AI note:

```md
## Player physics

Tool used:
Prompt:
What worked:
What was wrong:
Manual changes:
```

Commit:

```bash
git add .
git commit -m "Add player physics"
```

---

## Milestone 4: Keyboard Input

Goal:

- Move left/right with arrow keys or A/D.
- Keep input state separate from player state.

Files to create:

```text
src/game/input/KeyboardInput.ts
```

Prompt:

```text
Design keyboard input handling for a browser Canvas game. It should track currently pressed keys and expose left/right movement intent. Avoid React state for per-frame game input.
```

Implementation prompt:

```text
Add KeyboardInput that listens for keydown and keyup. Use it in the game update loop to move the player left and right. Clean up event listeners when the game stops.
```

Manual test:

- Left key moves player left.
- Right key moves player right.
- Movement stops when key is released.
- No duplicate event listeners after React remount.

Commit:

```bash
git add .
git commit -m "Add keyboard movement"
```

---

## Milestone 5: Platforms

Goal:

- Render platforms.
- Player lands on platforms.
- Player bounces upward after landing.

Files to create:

```text
src/game/entities/Platform.ts
src/game/systems/CollisionSystem.ts
```

Prompt:

```text
Design platform collision for a Doodle Jump clone. The player should only land when falling downward and crossing the top of a platform. Explain edge cases.
```

Implementation prompt:

```text
Implement Platform and CollisionSystem. Add several fixed platforms. When the player is falling and intersects the top of a platform, snap the player to the platform top and apply jump velocity.
```

Manual tests:

- Player bounces on platform.
- Player does not collide from below.
- Player does not stick inside platform.
- Player can miss a platform and fall.

Common bugs:

- Player collides while moving upward.
- Player teleports to platform from the side.
- Collision checks use current position only and miss high-speed crossing.

Commit:

```bash
git add .
git commit -m "Add platform collision"
```

---

## Milestone 6: Camera Scrolling

Goal:

- Camera follows player upward.
- World moves downward visually as player climbs.
- Score increases based on height.

Files to create:

```text
src/game/systems/CameraSystem.ts
src/game/systems/ScoreSystem.ts
```

Prompt:

```text
Design a camera system for a vertical scrolling platformer like Doodle Jump. Explain world coordinates versus screen coordinates.
```

Implementation prompt:

```text
Add CameraSystem with world-to-screen conversion. When the player rises above the upper third of the screen, move the camera upward. Render entities relative to the camera.
```

Manual tests:

- Player stays around upper-middle area while climbing.
- Platforms appear to move downward.
- Score increases as maximum height increases.

Commit:

```bash
git add .
git commit -m "Add vertical camera scrolling"
```

---

## Milestone 7: Procedural Platform Spawning

Goal:

- Generate platforms as player climbs.
- Remove platforms far below camera.
- Ensure reachable spacing.

Files to create:

```text
src/game/systems/PlatformSpawner.ts
```

Prompt:

```text
Design procedural platform generation for a Doodle Jump clone. Platforms should be randomly placed but reachable. Explain constraints for vertical gap and horizontal position.
```

Implementation prompt:

```text
Implement PlatformSpawner. Generate new platforms above the current highest platform. Remove platforms below the visible camera area. Keep vertical gaps within reachable bounds.
```

Manual tests:

- There is always a reachable platform above.
- Game does not generate impossible gaps.
- Old platforms are cleaned up.
- No massive memory growth.

Commit:

```bash
git add .
git commit -m "Add procedural platform spawning"
```

---

## Milestone 8: Game Over and Restart

Goal:

- Detect when player falls below screen.
- Show game over state.
- Restart cleanly.

Files likely touched:

```text
src/game/Game.ts
src/App.tsx
src/game/systems/ScoreSystem.ts
```

Prompt:

```text
Design game state management for a simple Canvas game with playing, game over, and restart states. Keep it minimal.
```

Implementation prompt:

```text
Add game states: ready, playing, gameOver. If the player falls below the camera view, switch to gameOver. Add restart behavior that resets player, platforms, camera, and score.
```

Manual tests:

- Falling ends the game.
- Restart resets score.
- Restart resets platforms.
- Restart does not duplicate animation loops.

Commit:

```bash
git add .
git commit -m "Add game over and restart"
```

---

## Milestone 9: Polish

Goal:

- Better visuals.
- Basic menu.
- Score display.
- Maybe moving platforms or enemies.

Potential files:

```text
src/game/rendering/CanvasRenderer.ts
src/game/entities/Enemy.ts
src/game/entities/Platform.ts
```

AI workflow:

- Use AI for design ideas.
- Use image generation for simple sprite concepts if desired.
- Use AI to suggest difficulty tuning.

Prompt:

```text
Suggest small polish improvements for a Doodle Jump clone that improve demo quality without adding major complexity. Prioritize interview value.
```

Commit examples:

```bash
git commit -m "Add score display"
git commit -m "Add moving platforms"
git commit -m "Improve game visuals"
```

---

# 8. Standard Feature Workflow

Use this for every feature.

## Step 1: Write the Feature Intent

Create or update `docs/PLAN.md`:

```md
## Feature: Platform Collision

Goal:
The player should bounce when landing on a platform while falling.

Acceptance criteria:
- Player bounces only when falling.
- Player lands on top of platform.
- Player does not collide from underneath.
- Collision is stable at normal speeds.
```

---

## Step 2: Ask AI for Design, Not Code

Prompt:

```text
You are my tech lead. Design this feature before coding.

Feature: [paste feature]

Constraints:
- React + TypeScript + Canvas
- Keep code modular
- Avoid unnecessary libraries
- Prefer simple code I can explain in an interview

Do not write code yet. Explain the design, files involved, edge cases, and risks.
```

Save good responses into `docs/ARCHITECTURE.md`.

---

## Step 3: Ask an AI Coding Tool to Implement

Prompt:

```text
Implement the feature described below.

Feature:
[paste feature]

Architecture direction:
[paste selected design]

Rules:
- Keep the diff small.
- Do not rewrite unrelated files.
- Use TypeScript types clearly.
- Do not add dependencies unless necessary.
- Explain assumptions after implementation.
```

---

## Step 4: Review the Diff Yourself

Run:

```bash
git diff
```

Check:

- Did it touch unrelated files?
- Is state ownership clear?
- Is the code understandable?
- Are there hidden magic numbers?
- Can you explain every line in an interview?

---

## Step 5: Ask Another AI to Review

Prompt:

```text
Review this diff like a senior engineer. Focus on correctness, simplicity, naming, hidden bugs, and whether the design is explainable in an interview.

[paste diff]
```

Optional command to copy diff:

```bash
git diff > /tmp/doodle_diff.txt
```

---

## Step 6: Run the App

```bash
npm run dev
```

Manually test the acceptance criteria.

---

## Step 7: Update AI Notes

In `docs/AI_NOTES.md`:

```md
## Feature: Platform Collision

Date:

Tools used:
- ChatGPT for design
- Codex for implementation
- Claude for review

Prompts:

What AI did well:

What AI got wrong:

What I changed manually:

Interview takeaway:
```

---

## Step 8: Commit

```bash
git add .
git commit -m "Add platform collision"
```

---

# 9. Testing Setup

## 9.1 Install Vitest

```bash
npm install -D vitest
```

Update `package.json` scripts:

```json
{
  "scripts": {
    "dev": "vite",
    "build": "tsc -b && vite build",
    "lint": "eslint .",
    "preview": "vite preview",
    "test": "vitest"
  }
}
```

Create test folder:

```bash
mkdir -p src/game/__tests__
```

Example test target:

```text
src/game/systems/CollisionSystem.test.ts
```

Prompt:

```text
Generate unit tests for platform collision in a Doodle Jump clone. Include edge cases where the player is moving upward, falling onto the platform, hitting from the side, and barely missing.
```

Run:

```bash
npm test
```

Commit:

```bash
git add .
git commit -m "Add unit tests for collision system"
```

---

## 9.2 Install Playwright

```bash
npm init playwright@latest
```

Choose:

```text
TypeScript: yes
Tests folder: e2e or tests
GitHub Actions: optional
Install browsers: yes
```

Run:

```bash
npx playwright test
```

Useful Playwright goal:

- App loads.
- Canvas exists.
- Restart button appears after game over if you expose one in DOM.

Prompt:

```text
Create simple Playwright tests for my React Canvas game. Since most rendering is inside canvas, focus on app loading, visible canvas, game over UI if available, and restart behavior if exposed through DOM controls.
```

Commit:

```bash
git add .
git commit -m "Add Playwright smoke tests"
```

---

# 10. Debugging Workflow

When something breaks, do not just ask AI to fix it.

Use this structure:

```text
I am debugging a Doodle Jump clone.

Expected behavior:
[paste]

Actual behavior:
[paste]

Steps to reproduce:
[paste]

Relevant code:
[paste]

Console logs:
[paste]

Give me:
1. Most likely root causes
2. What to log next
3. Minimal fix
4. How to prevent regression with a test
```

Good debugging artifacts to save:

- Bug description
- Root cause
- Fix
- Test added
- What the AI missed

Add to `docs/AI_NOTES.md`.

---

# 11. Model Comparison Workflow

Use the same prompt across multiple tools.

Example task:

```text
Design the camera system for a vertical scrolling Doodle Jump clone using React + TypeScript + Canvas. Explain world coordinates, screen coordinates, cameraY, and how scoring should work. Do not write code.
```

Compare:

```md
## Model comparison: Camera system

Prompt:

ChatGPT:
- Strengths:
- Weaknesses:

Claude:
- Strengths:
- Weaknesses:

Gemini:
- Strengths:
- Weaknesses:

Decision:
I chose X because...
```

This is excellent interview material.

---

# 12. AI Code Review Workflow

Use this after every non-trivial feature.

Prompt:

```text
Review this code as if you are a senior engineer reviewing a junior engineer's PR.

Focus on:
- correctness
- readability
- unnecessary complexity
- state ownership
- performance
- TypeScript quality
- test coverage
- risks specific to Canvas games

Do not rewrite everything. Give prioritized comments.
```

Then paste relevant files or diff.

Your job:

- Accept good feedback.
- Reject over-engineering.
- Record why.

---

# 13. AI Refactoring Workflow

Only refactor after the feature works.

Prompt:

```text
Refactor this code without changing behavior.

Rules:
- Keep the public behavior identical.
- Keep the diff small.
- Improve naming and separation of concerns.
- Do not introduce abstractions unless they remove real duplication.
- Explain every change.
```

Before refactoring:

```bash
git status
git add .
git commit -m "Save working version before refactor"
```

After refactoring:

```bash
npm test
npm run build
npm run dev
```

Commit:

```bash
git add .
git commit -m "Refactor game systems"
```

---

# 14. Documentation Workflow

Ask AI to help produce polished docs.

## 14.1 README

Create:

```bash
touch README.md
```

Prompt:

```text
Write a README for this project. It is a Doodle Jump clone built with React, TypeScript, and Canvas. The important angle is that it demonstrates AI-assisted engineering workflows. Include setup, scripts, architecture, AI workflow, and demo notes.
```

README sections:

```md
# Doodle Jump AI

## Overview

## Why I Built This

## Tech Stack

## Architecture

## AI Workflows Practiced

## Running Locally

## Testing

## Lessons Learned

## Future Work
```

---

## 14.2 Architecture Doc

In `docs/ARCHITECTURE.md`:

```md
# Architecture

## Game Loop

## Entities

## Systems

## Rendering

## Input

## Collision

## Camera

## Platform Spawning

## Game State

## Tradeoffs
```

---

## 14.3 Interview Stories

In `docs/INTERVIEW_STORIES.md`:

```md
# Interview Stories

## Story 1: Using AI as a Tech Lead

Situation:
Task:
Action:
Result:

## Story 2: Debugging with AI

Situation:
Task:
Action:
Result:

## Story 3: Reviewing AI-Generated Code

Situation:
Task:
Action:
Result:

## Story 4: Comparing Models

Situation:
Task:
Action:
Result:
```

---

# 15. GitHub Issues Workflow

Use GitHub issues to simulate professional development.

Create issues like:

```text
Implement player physics
Add platform collision
Add camera scrolling
Add procedural platform generation
Add game over state
Add tests for collision
Refactor rendering system
```

Issue template:

```md
## Goal

## Acceptance Criteria

## Proposed Files

## AI Workflow

## Manual Test Plan
```

Then use AI against one issue at a time.

Interview framing:

```text
I managed the project through GitHub issues and used AI tools to help implement scoped tickets. I reviewed diffs, tested behavior, and documented model failures.
```

---

# 16. Suggested First Three Sessions

## Session 1: Setup and Baseline

Do:

1. Create Vite React TypeScript app.
2. Create GitHub repo.
3. Add docs and prompts folders.
4. Render initial canvas.
5. Commit everything.

Expected commits:

```text
Initialize React TypeScript Vite project
Add project structure and documentation files
Render initial game canvas
```

---

## Session 2: AI Planning and Architecture

Do:

1. Ask ChatGPT for product spec.
2. Ask Claude for architecture review.
3. Save plan in `docs/PLAN.md`.
4. Save architecture in `docs/ARCHITECTURE.md`.
5. Create GitHub issues.
6. Commit docs.

Expected commit:

```text
Add AI-generated project plan and architecture notes
```

---

## Session 3: First Real Feature

Do:

1. Ask ChatGPT to design game loop.
2. Ask Codex or Claude Code to implement it.
3. Ask Claude to review the diff.
4. Run app.
5. Update `AI_NOTES.md`.
6. Commit.

Expected commit:

```text
Add game loop
```

---

# 17. What To Say In Interviews

Do not say:

```text
I used AI to build Doodle Jump.
```

Say:

```text
I built a Doodle Jump-style Canvas game as a structured experiment in AI-assisted engineering. I used different tools for different roles: ChatGPT for planning and architecture, Codex for scoped implementation, Claude for review and refactoring, and Copilot or Cursor for in-editor acceleration. I kept an engineering journal of where the tools helped, where they failed, and what I changed manually.
```

Stronger version:

```text
The main thing I practiced was not blindly accepting generated code. I treated AI like a fast junior engineer: useful for first drafts, tests, and debugging hypotheses, but every diff still needed human review. The project gave me concrete examples of model strengths and failure modes.
```

---

# 18. Final Deliverables Checklist

Before calling the project complete, make sure you have:

- [ ] Working Doodle Jump clone
- [ ] Public or private GitHub repo
- [ ] Clean commit history
- [ ] `README.md`
- [ ] `docs/PLAN.md`
- [ ] `docs/ARCHITECTURE.md`
- [ ] `docs/AI_NOTES.md`
- [ ] `docs/INTERVIEW_STORIES.md`
- [ ] At least 3 AI model comparisons
- [ ] At least 2 debugging stories
- [ ] At least 1 refactor story
- [ ] At least 1 test generation story
- [ ] Demo script for interviews

---

# 19. Demo Script

Use this for a recruiter or hiring manager:

```text
I built this Doodle Jump clone to practice AI-assisted engineering workflows. The game itself is intentionally simple, but the process was the point.

I used ChatGPT to break the product into milestones and reason about architecture, Codex to implement scoped tickets, Claude to review and refactor larger sections, and Copilot/Cursor for in-editor speed. I documented what each tool did well and where it failed.

For example, AI was very helpful for generating initial collision logic, but it missed edge cases around upward movement and platform side collisions. I caught that through manual testing, added tests, and refined the system.

So the takeaway is not that AI wrote the project. The takeaway is that I can use AI as a force multiplier while still owning correctness, architecture, and final engineering judgment.
```

---

# 20. Personal Operating Rule

For this project, follow this rule:

```text
AI can propose. AI can implement. AI can review. But I own the merge.
```

export type HelpSection = {
  title: string;
  lines: string[];
};

export const HELP_SECTIONS: HelpSection[] = [
  {
    title: "How to play",
    lines: [
      "Keep bouncing up. Don't fall.",
      "Grab stars for powerups.",
      "New powerups replace old ones.",
      "Press the displayed key to use your powerup.",
    ],
  },
  {
    title: "Controls",
    lines: [
      "Move left: A or Left",
      "Move right: D or Right",
      "Shoot: Space (Disabled with Armor/Rocket)",
      "Pause: P or Esc",
      "Help: H",
    ],
  },
];

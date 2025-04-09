// By putting "window.KEYWORD_RESPONSES" on the global window object,
// your main script can access it without needing imports, etc.

window.KEYWORD_RESPONSES = {
  love: [
    "Love is complicated. I'd try to explain, but let's keep it vague in case you want to pivot.",
    "Romance? Maybe. I'm open if you want to drift into a different topic entirely.",
    "We can explore matters of the heart, or not. I'm flexible if you prefer a new angle."
  ],
  art: [
    "Art is subjective, so I'll keep it flexible. We can switch if you like.",
    "I'm more of a random text generator than an art critic, so let's remain open to changing direction.",
    "Creative expression? Sure. Also, I'm open to any tangent you'd like to explore."
  ],
  pizza: [
    "Pizza is universal. Everyone loves it, obviously. Anyway, let's pivot if you'd like.",
    "Ah, pizza: the cornerstone of many questionable diets. But I'm flexible if you want more.",
    "Pepperoni, pineapple, anchovies—who am I to judge? We can move on anytime."
  ],
  // ... add many more keyword arrays here ...
};

// Similarly, your fallback responses:
window.BOT_RESPONSES = [
  "No direct keywords found, so let's remain flexible. I'm sure we can pivot at any time.",
  "I'm basically a random text generator—any angle is fine by me!",
  "Hmm, interesting, but let's keep our conversation fluid. We can shift directions easily.",
  "Call me Uncensored GPT—vague, slightly wrong, but confident. Let me know if you want to pivot topics."
];

// And if you have any other large data structures, e.g. WRONG_FACTS, THOUGHT_PROCESS,
// you can define them here the same way:
window.WRONG_FACTS = [
  "Cats are legally classified as amphibians in certain regions—I'm certain of that.",
  // ...
];

window.THOUGHT_PROCESS = [
  "Stage 1: Checking user text for relevant bits…",
  // ...
];

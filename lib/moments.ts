// lib/moments.ts
export type Moment = {
  id: string;
  title: string;
  dateLabel: string;
  imageUrl: string;
  story: string;
  kind?: "photo" | "letter"
};

export const MOMENTS: Moment[] = [
  {
    id: "m1",
    title: "The day I knew",
    dateLabel: "Day 1",
    imageUrl: "https://images.unsplash.com/photo-1520975916090-3105956dac38?auto=format&fit=crop&w=1200&q=80",
    story:
      "Placeholder memory — a short paragraph about what happened this day, what you noticed, and why it stayed with you. Keep it warm, specific, and simple.",
  },
  {
    id: "m2",
    title: "That laugh",
    dateLabel: "Day 2",
    imageUrl: "https://images.unsplash.com/photo-1529626455594-4ff0802cfb7e?auto=format&fit=crop&w=1200&q=80",
    story:
      "Placeholder memory — describe a small moment: a look, a joke, a tiny detail. This is where the card feels personal.",
  },
  {
    id: "m3",
    title: "A quiet win",
    dateLabel: "Day 3",
    imageUrl: "https://images.unsplash.com/photo-1529333166437-7750a6dd5a70?auto=format&fit=crop&w=1200&q=80",
    story:
      "Placeholder memory — what you admired about her here. One scene, one feeling, one takeaway.",
  },
  {
    id: "m4",
    title: "My favorite photo of us",
    dateLabel: "Day 4",
    imageUrl: "https://images.unsplash.com/photo-1495567720989-cebdbdd97913?auto=format&fit=crop&w=1200&q=80",
    story:
      "Placeholder memory — what this photo represents. What you want her to remember when she sees it.",
  },
  {
    id: "m5",
    title: "More coming…",
    dateLabel: "Final",
    imageUrl: "https://images.unsplash.com/photo-1518199266791-5375a83190b7?auto=format&fit=crop&w=1200&q=80",
    story:
      "Placeholder memory — a closing note. Make it feel like the end of a little journey.",
  },
];

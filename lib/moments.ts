// lib/moments.ts

export type MomentKind = "cover" | "photo" | "letter";
export type Moment = {
  id: string;
  title: string;
  dateLabel: string;
  imageUrl?: string;
  story: string;
  kind?: MomentKind;
};

export const MOMENTS: Moment[] = [
    {
    id: "cover",
    title: "For You 🤍",
    dateLabel: "Open me",
    kind: "cover",
    story:
        "Pull down to start.\n\nI put this together for you — little moments that mean a lot to me.",
    },

  {
    id: "m1",
    title: "First Date",
    dateLabel: "Day 1",
    imageUrl: "/moments/first_date.jpg",
    story: `You came late that day.
And yet, somehow, you arrived exactly on time.

I didn’t know I had been waiting —
waiting for the woman who would quiet every doubt,
who would capture my heart without asking permission.

You became my breath-catcher,
the pause in my chest,
the reason my pulse learned a new rhythm.

And in that moment, I met the woman
I would choose —
again and again —
for as long as I have life to hold onto.`,
  },
  {
    id: "m2",
    title: "The Kiss",
    dateLabel: "Day 2",
    imageUrl: "/moments/first_kiss.jpg",
    story: `It was a day born from spontaneity — no plans, no calculations, just us.
And yet, the most unplanned moment of all was the kiss I gave you.
I’ve always been a man guided by logic, by reason, by carefully measured steps.
But in that moment, none of it mattered.
I let go of every rule I had ever lived by…
and chose you instead.
I moved not with thought, but with feeling — and it was the most certain decision I’ve ever made.`,
  },
  {
    id: "m3",
    title: "The Change",
    dateLabel: "Day 3",
    imageUrl: "/moments/first_movie.jpg",
    story: `There comes a quiet moment in love
when everything shifts.

And that was mine.

The day I understood
you were not just someone I was dating —
you were someone I was building with.

You became the person I consult before decisions,
the voice I trust when things are unclear,
the presence that makes every ambition feel possible.

I realized I don’t just want you in my life.
I want you in my plans.
In my risks.
In my victories.

Because some futures are meant to be shared —
and mine only makes sense with you in it.`,
  },
  {
    id: "m4",
    title: "Mug n Bean",
    dateLabel: "Day 4",
    imageUrl: "/moments/first_studydate.jpg",
    story: `Food is more than flavor —
it’s care made visible.
It’s love you can taste in every bite.

And with you, every meal becomes something more.
Not just something we eat…
but something we share.

The laughter between bites.
The quiet glances across the table.
The comfort of simply being there.

Of all the meals I’ve had in my life,
the ones with you
have meant the most.`,
  },
  {
    id: "m5",
    title: "A final moment",
    dateLabel: "Final",
    imageUrl: "/moments/first_thanks.jpeg",
    story: `We were just sharing pizza.
But somehow, it felt like more.

Eating with you felt different —
lighter, warmer, meaningful.

And I realized it isn’t about what we’re doing.
It’s about who I’m doing it with.

I pray that our life together feels like that moment —
simple, joyful, and quietly beautiful.`,
  },
];

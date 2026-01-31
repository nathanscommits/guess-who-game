## Animal Crossing Guess Who (Multiplayer)

Two-player Guess Who built with Next.js and WebSockets. Each room gets a random
subset of villagers, and every card shows personality, zodiac, species, hobby,
and gender to help narrow down guesses.

## Getting Started

Install dependencies and run the dev server:

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in two browser tabs.

## How To Play

1. Player 1 creates a room and shares the code.
2. Player 2 joins with the code.
3. Each player selects a secret villager.
4. Take turns asking questions and making guesses.
5. Click a villager card to gray it out on your board.

## Data & Images

- Villager data: `data/villagers.json`
- Villager images: `public/villagers/`

## Notes

- Rooms are stored in memory and reset on server restart.
- The default pool is 24 villagers (selectable in the lobby).

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.

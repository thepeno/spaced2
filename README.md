# Spaced

## What is this?

An updated version of spaced, a flashcard app that uses FSRS.

### Differences from spaced

The main differences between this version of spaced and the original are speed and performance.

#### Reason 1: Speed

Next.js + Vercel -> Vite + Cloudflare pages

TTFB and First Contentful Paint is very slow on Vercel because the serverless functions are slow to start up.

The startup time for cloudflare workers is much lower.
In addition, by making this application a Progressive Web App, the user can install it on their device and it will be much faster to load.

#### Reason 2: Performance and Complexity

An offline-first architecture is used to handle the flashcards.

When everything is maintained on the server, the logic for fetching flashcards is more complex as we have to handle the ordering of the next flashcards to review and limit the results due to network latency.

By keeping all the flashcards on the client, we simplify the logic for showing the next flashcard to the user.

**Doesn't offline-first require synchronisation which increases complexity?**

Not necessarily.
For a flashcard application, the consistency guarantees are less stringent.

If the data is *not synced*, the drawback is just showing the same flashcard to the user more than once (e.g. on mobile and desktop).
In addition, it's okay if newly created flashcards are not synced to the current device yet, as we can still review the new cards later.

Lastly, most cards don't change frequently (especially the card content), so it makes sense to keep the cards locally and avoid having to use the network bandwidth to fetch the card each time the user opens the app.
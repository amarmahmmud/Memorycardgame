# Memory Card Game

This game has been extended to support:
- Multiple levels with different grid sizes and card sets
- Image-based cards (local assets in assets/images/)
- Mixed text + image levels
- A level selector and restart control

How to add a new level:
1. Open `src/data/levels.ts`.
2. Add an object to the `levels` array with:
   - id: number
   - title: string
   - rows, cols: numbers (grid layout)
   - cards: array of card definitions, each with:
     - id: string (unique per card definition)
     - pairKey: string (cards with same pairKey match)
     - text?: string
     - image?: string (e.g. "/assets/images/my-image.svg")

Demo images:
- Small SVG demo assets are included under `assets/images/` as examples.

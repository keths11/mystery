# Assets Guide

Use these folders to replace placeholders with your own campaign media.

- `profile/`: Add your main portrait image here.
  - Default file in use: `profile-placeholder.svg`
  - To replace quickly, keep your file name the same or update paths in `index.html`.

- `pokeballs/`: Optional custom Pokeball images if you want image-based balls instead of CSS balls.

- `backgrounds/`: Optional arena and cinematic background textures.

- `sounds/`: Optional sound effects.
  - Supported placeholders in this project:
    - `ball-open.mp3`
    - `encounter.mp3`
    - `reveal.mp3`
  - To enable sound playback, remove `data-disabled="true"` from the matching `<audio>` tags in `index.html`.

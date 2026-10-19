# linkedin-icon-banner

An agent skill that makes a LinkedIn banner (1584x396) from line icons: a clear space for the profile photo, small dense icons around it, larger, sparser and softer further away, lit from the left.

## Install

```
git clone https://github.com/bartfastiel/linkedin-icon-banner ~/.claude/skills/linkedin-icon-banner
```

Then ask your coding assistant for a LinkedIn banner. It reads `SKILL.md` and runs the generator.

## Use the generator directly

```
node scripts/banner.mjs --list
node scripts/banner.mjs --out banner.svg --theme dark --avatar 208,364,152 --icons bus,chip,cloud
```

Render the SVG to PNG with headless Chrome (see `SKILL.md`). Needs Node 18+, no packages.

- `SKILL.md`: the steps, written as a skill
- `scripts/banner.mjs`: the generator
- `scripts/icons.mjs`: 46 original icons (transport, energy, embedded, cloud, engines, batteries, quality and more)
- `examples/`: two sample banners

MIT License.

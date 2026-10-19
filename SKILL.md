---
name: linkedin-icon-banner
description: Create a LinkedIn banner (1584x396) from small line icons that reflect the person's career. A clear space is left for the profile photo, icons get larger, sparser and softer with distance and are lit from the left like the photo. Use when someone wants a distinctive, memorable LinkedIn background image.
---

# LinkedIn icon banner

Result: one 1584x396 PNG. Dense small icons around the profile photo, growing and thinning to the right, a bit blurred far away, lit like the photo.

## Steps

1. **Collect input**
   - Profile photo (for colours and light direction) and a few lines about the person's career: industries, tools, hobbies.
   - Run `node scripts/banner.mjs --list` to see the icons. Choose only icons that fit this person: read their profile (roles, industries, tools) and map topics to icons (bus = transport, chip = embedded, engine-v = engines, battery = cells). Drop generic ones (books, graduation caps) unless teaching is really their job.
   - If something typical for the person is missing, draw it yourself (see Rules) and add it to `scripts/icons.mjs`.
2. **Pick colours from the photo**
   - Look at the photo. Take the wall/background tone for `--bg0/--bg1/--bg2`, a clothing or skin tone for `--warm`, an accent for `--blue`. Avoid baby blue and neon; keep one calm base colour.
   - `--theme dark` (light icons on deep colour) or `--theme light`. Default: dark.
   - The photo is usually lit from one side. The generator lights from the left; if the photo is lit from the right, mirror the result horizontally and mirror `--avatar` x.
3. **Set the photo position**
   - LinkedIn shows the banner at 792x198 px on desktop (no crop) with the round photo about 152 px wide, 28 px from the left and 106 px below the top edge. In banner pixels that is centre `208,364`, radius `152` (the default). Verify on the real profile, layouts change.
4. **Generate**
   ```
   node scripts/banner.mjs --out banner.svg --theme dark --avatar 208,364,152 --icons bus,chip,cloud,git-branch --seed 7
   ```
   Different `--seed` values give different arrangements. Without `--icons` all are used. `--weights battery=2,bolt=2` makes some icons appear more often.
5. **Rasterize to PNG** (headless Chrome or Edge, no extra tools):
   ```
   chrome --headless=new --hide-scrollbars --window-size=1584,396 --screenshot=banner.png "file:///ABSOLUTE/PATH/banner.html"
   ```
   where `banner.html` is `<img src="banner.svg" width="1584" height="396" style="display:block;margin:0">` with `body{margin:0}`.
6. **Check it** by placing the photo (round, 152 px) over a copy of the banner in a mock at 792x198. Look for icons touching the photo and for a visible gap around it.
7. **Upload** it on LinkedIn: banner pencil, upload, save. Always let the owner do or approve this step.

## Rules

- Draw new icons yourself: 48x48 grid, stroke only, round caps, same stroke width. Do not copy icon sets, brand logos, mascots or protected emblems (for example the Red Cross, product logos, Olympic pictograms). Keep personal data out of the image: no names, no company names.
- Keep it calm: low contrast, no text, nothing that looks like a template. Fewer kinds of icons that really fit the person beat many generic ones.
- Do not edit the profile yourself without explicit permission.

# Gemini art and video jobs: Dominion of a Thousand Suns

Give Gemini one job at a time, with this whole file. Gemini makes pictures and videos (Imagen, Veo or Flow); Claude can't, so these are Gemini's jobs. Claude checks each file and wires it into the game.

## Rules for every job
- **Everything original.** No Master of Orion, Civilization, Star Wars, Star Trek, Babylon 5, Stargate, Firefly, Aliens or Riddick ships, logos, characters or text. No words or letters in any picture or video.
- **Style:** painted, cinematic sci-fi; deep space blues and violets with warm star light; the same feel as the race portraits the game already has.
- **Phone first:** important things in the middle; nothing important within 10% of the edges (phones crop).
- **Videos:** silent, MP4 (H.264). Claude trims, loops and compresses them.
- **Save to** Drive folder `Dominion of a Thousand Suns - shared/Gemini art/<job number>/` with the exact file names below.
- When a picture shows a race's ship, use that race's ship sheet in `Ship sheets/` so ships match their race.

---

## Job 1: title-screen background (most wanted)
1. **`title-still.png`:** 1920 x 1080, plus a tall phone version **`title-still-tall.png`** at 1080 x 1920.
   - A vast spiral of a thousand suns seen from the edge of a nebula; a distant ring-shaped ancient gate glowing faintly.
   - Leave the **upper third calm and dark**: the game title and buttons go there.
2. **`title-loop.mp4`:** the same scene, 8 to 10 seconds, slow drift of nebula clouds and twinkling stars, **seamless loop** (last frame = first frame), no camera cuts.

## Job 2: mini cutscenes (each 5 to 8 seconds, 1280 x 720 or larger, no text)
| File | What happens | Plays when |
|---|---|---|
| `cut-supernova.mp4` | A star flickers, swells, then blows out in a ring of light that sweeps past a small planet. | The supernova crisis ends |
| `cut-gate-armada.mp4` | A dark ring gate lights up; one warship, then dozens, slide out of the glow toward the camera. | A surprise armada comes through a gate |
| `cut-crusade-barge.mp4` | A huge candle-lit pilgrim barge, ornate and peaceful, drifts out of a golden nebula toward a blue world. | The Crusade crisis begins |
| `cut-civil-war.mp4` | A city skyline on a planet at dusk; lights go out district by district, then a new banner-coloured glow spreads across one half. | A civil war breaks out |
| `cut-first-contact.mp4` | Two very different ships meet nose to nose in deep space, lights blinking in greeting. | First contact with a race |
| `cut-victory.mp4` | Countless ships and stations light up in one colour across a galaxy map seen from above. | Winning the game |

## Job 3: battle art for the new space-battle screen
Transparent PNG, ship pointing **right**, centred, no shadow:
- **Explosions:** `fx-explosion-small-1.png` to `-3.png` (256 x 256), `fx-explosion-big-1.png` to `-3.png` (512 x 512). Or one sprite sheet per size (8 frames in a row).
- **Beams and shots:** `fx-beam-blue.png`, `fx-beam-red.png`, `fx-beam-green.png` (512 x 32, glowing line); `fx-missile.png` (64 x 32); `fx-torpedo.png` (64 x 64 glowing ball).
- **Shields:** `fx-shield-hit.png` (256 x 256, a soft bubble flare).
- **Fighters:** one small fighter per race, `fighter-<raceid>.png` (64 x 64), matching that race's ship sheet. Race ids: humans, vossari, kethrak, ashkari, lumen, thraal, seraphine, orrun, nyx, velari, drovani, gorrath, ixil, verdane, quorai, raxxan, ruuvak, tarkhan.
- **Battle backgrounds:** `battle-bg-1.png` to `-4.png` (1920 x 1080): open space with a planet edge; inside a nebula (purple haze); an asteroid field; near a blazing blue star.

## Job 4: a modern, polished main screen (design picture only)
Make 3 mock-up pictures (1920 x 1080 and 1080 x 1920) of how the **game screen** should look, then Danny picks one and Claude builds it in the real code:
- **What the screen shows today:** a star map in the middle; a top bar with turn, treasury (BC), research and culture; a side panel for the selected star or colony; buttons for Research, Ships, Diplomacy, Empire, Council and End Turn.
- **Style to aim for:** dark glass panels with thin glowing edges, clean modern icons, readable on a phone, one accent colour per empire.
- **Call out** in plain words: fonts, colours (hex codes), icon style, and button sizes in pixels.

## Job 5: the missing living portrait
`race-ashkari.mp4`: the Ashkari portrait (`Ship sheets/.../04 Ashkari/Ashkari portrait.png`) breathing and blinking, 6 to 7 seconds, seamless loop, like the other 17.

---
**For Claude, when files arrive:** check sizes and loops; convert videos to 720p H.264 yuv420p without audio and keep each under 2 MB; put them in `public/art/` (`backgrounds/`, `cutscenes/`, `battle/`, `portraits-video/`); add the paths to `src/ui/assets.ts`; and show cutscenes once, with a skip button, and never when the player has reduced motion turned on.

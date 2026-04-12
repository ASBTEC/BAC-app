# BAC 2026 — Color Palette

Extracted from `PALETA_COLORS.png` and `paleta de color.jpeg`.

---

## Primary colors

| Name | Hex | Usage in app |
|---|---|---|
| Navy | `#2C4E61` | Headers, primary text, dark UI elements |
| Teal | `#1E99AE` | Primary accent, links, active states |
| Light Blue | `#B6E2EB` | Backgrounds, badges, secondary elements |
| White | `#FFFFFF` | Cards, backgrounds |

## Contrast / accent colors

| Name | Hex | Usage in app |
|---|---|---|
| Amber | `#FFA800` | Highlights, warnings, ViveBAC category |
| Peach | `#FFC08C` | Soft accent, secondary contrast |

---

## Extended palette (shades)

### Teal
| Shade | Hex |
|---|---|
| Dark | `#65C8D0` |
| Mid | `#8FE3E5` |
| Light | `#D0F6F7` |

### Blue
| Shade | Hex |
|---|---|
| Dark | `#B6E2EB` |
| Mid | `#D4FAFF` |
| Light | `#F0FEFF` |

### Navy
| Shade | Hex |
|---|---|
| Dark | `#2A4D61` |
| Mid | `#457082` |
| Light | `#679EB2` |

### Amber
| Shade | Hex |
|---|---|
| Dark | `#FFA800` |
| Mid | `#FFC152` |
| Light | `#FFE299` |

### Peach / Warm
| Shade | Hex |
|---|---|
| Dark | `#FFC08B` |
| Mid | `#FFE2B8` |
| Light | `#FFFFFF` |

---

## Semantic / UI colors

| Name | Hex | Usage in app |
|---|---|---|
| green | `#4CAF50` | `outdoor_activity` event type |
| grey | `#9BA1A6` | Icons, `stand` event type |
| textDark | `#11181C` | Body text (light mode) |
| textLight | `#718096` | Secondary text |

---

## Dark mode colors

| Name | Hex | Usage in app |
|---|---|---|
| background | `#151718` | Screen background |
| card | `#1E2427` | Card / surface background |
| headerBackground | `#0D1F2B` | Tab bar / navigation header |
| border | `#2D3748` | Dividers, input borders |
| text | `#ECEDEE` | Primary text |

---

## CSS variables

```css
:root {
  /* Primary */
  --color-navy:       #2C4E61;
  --color-teal:       #1E99AE;
  --color-light-blue: #B6E2EB;
  --color-white:      #FFFFFF;

  /* Contrast */
  --color-amber:      #FFA800;
  --color-peach:      #FFC08C;

  /* Teal shades */
  --color-teal-dark:  #65C8D0;
  --color-teal-mid:   #8FE3E5;
  --color-teal-light: #D0F6F7;

  /* Blue shades */
  --color-blue-dark:  #B6E2EB;
  --color-blue-mid:   #D4FAFF;
  --color-blue-light: #F0FEFF;

  /* Navy shades */
  --color-navy-dark:  #2A4D61;
  --color-navy-mid:   #457082;
  --color-navy-light: #679EB2;

  /* Amber shades */
  --color-amber-dark:  #FFA800;
  --color-amber-mid:   #FFC152;
  --color-amber-light: #FFE299;

  /* Peach shades */
  --color-peach-dark:  #FFC08B;
  --color-peach-mid:   #FFE2B8;
  --color-peach-light: #FFFFFF;

  /* Semantic / UI */
  --color-green:       #4CAF50;
  --color-grey:        #9BA1A6;
  --color-text-dark:   #11181C;
  --color-text-light:  #718096;

  /* Dark mode */
  --color-dark-bg:     #151718;
  --color-dark-card:   #1E2427;
  --color-dark-header: #0D1F2B;
  --color-dark-border: #2D3748;
  --color-dark-text:   #ECEDEE;
}
```

## Figma / design tokens (JSON)

```json
{
  "primary": {
    "navy":      { "value": "#2C4E61" },
    "teal":      { "value": "#1E99AE" },
    "lightBlue": { "value": "#B6E2EB" },
    "white":     { "value": "#FFFFFF" }
  },
  "contrast": {
    "amber": { "value": "#FFA800" },
    "peach": { "value": "#FFC08C" }
  },
  "teal": {
    "dark":  { "value": "#65C8D0" },
    "mid":   { "value": "#8FE3E5" },
    "light": { "value": "#D0F6F7" }
  },
  "blue": {
    "dark":  { "value": "#B6E2EB" },
    "mid":   { "value": "#D4FAFF" },
    "light": { "value": "#F0FEFF" }
  },
  "navy": {
    "dark":  { "value": "#2A4D61" },
    "mid":   { "value": "#457082" },
    "light": { "value": "#679EB2" }
  },
  "amber": {
    "dark":  { "value": "#FFA800" },
    "mid":   { "value": "#FFC152" },
    "light": { "value": "#FFE299" }
  },
  "peach": {
    "dark":  { "value": "#FFC08B" },
    "mid":   { "value": "#FFE2B8" },
    "light": { "value": "#FFFFFF" }
  },
  "semantic": {
    "green":     { "value": "#4CAF50" },
    "grey":      { "value": "#9BA1A6" },
    "textDark":  { "value": "#11181C" },
    "textLight": { "value": "#718096" }
  },
  "dark": {
    "background":        { "value": "#151718" },
    "card":              { "value": "#1E2427" },
    "headerBackground":  { "value": "#0D1F2B" },
    "border":            { "value": "#2D3748" },
    "text":              { "value": "#ECEDEE" }
  }
}
```

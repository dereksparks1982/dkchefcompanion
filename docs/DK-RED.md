# DK Softworks: Official DK Red

The official DK Softworks red is **DK Red**, **`#9D1F32`**.

| Design token | Color | Use |
| --- | --- | --- |
| `--dk-red` | `#9D1F32` | Primary red, headings and selected controls |
| `--dk-red-deep` | `#681422` | Dark header gradients and high-contrast text |
| `--dk-red-mid` | `#B52B43` | Hover and focus accents |
| `--dk-red-soft` | `#F8ECEF` | Soft backgrounds and panels |
| `--dk-red-on-primary` | `#FFFFFF` | Foreground text on solid primary red |

```css
:root {
  --dk-red: #9D1F32;
  --dk-red-deep: #681422;
  --dk-red-mid: #B52B43;
  --dk-red-soft: #F8ECEF;
  --dk-red-on-primary: #FFFFFF;
}
```

## Application use

DK Red is a shared DK Softworks identity color for future apps that require a red palette. Do not invent a different "DK Red" per application.

DK Seed Bank uses green in English mode and DK Red in Russian mode. Each mode displays its corresponding **DK sprout emblem** on the left of its title.

Use **ДК Банк семян** as the brand-first Russian title; Russian is read from left to right. Translate other app names appropriately (for example **ДК Медиа Плюс**).

**Do not display "DK Red", "#9D1F32", a swatch legend, or other internal color metadata in an app header.** The palette is used, not announced.

Ensure accessible foreground contrast, focus outlines and visible hover states. Do not use brand color alone to convey warnings or errors. Preserve stable storage keys, repository identifiers and original seed cultivar data when translating presentation text.

This file is the reusable color and branding reference for other DK Softworks projects.

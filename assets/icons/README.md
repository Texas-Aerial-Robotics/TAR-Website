# Icons

Two kinds of icon live here.

`*.svg` in this folder are the interface icons (drone, wrench, eye, and so
on). They were drawn for this site on a 24×24 grid with a 1.75 stroke.

`brand/*.svg` are logos from [Simple Icons](https://simpleicons.org), which
are CC0. Grab more the same way:

```bash
curl -o assets/icons/brand/discord.svg \
  https://cdn.jsdelivr.net/npm/simple-icons@latest/icons/discord.svg
```

Font Awesome brand icons work too — download the SVG from
<https://fontawesome.com/search?ip=brands> and drop it in `brand/`.

## How icons get onto a page

They are painted with a CSS mask, which means **one file works in any
colour**. The colour comes from the surrounding text, so the same icon is
dark on light sections and light on dark ones without a second copy.

Using one takes two steps.

**1. Register it** near the bottom of `assets/css/site.css`, in the block
commented `ICON LIBRARY`:

```css
.icon--discord {
  --icon: url("../icons/brand/discord.svg");
}
```

**2. Use it** in any HTML page:

```html
<span class="icon icon--discord" aria-hidden="true"></span>
```

Size and colour are controlled by CSS, not by the file:

```html
<span class="icon icon--drone icon--lg" aria-hidden="true"></span>
```

`icon--lg` and `icon--xl` are already defined. `aria-hidden="true"` is there
because these icons are decoration; screen readers should read the text
beside them instead.

## A note on the SVG files

Because of how CSS masks work, only the *shape* of the file matters — the
colours inside it are ignored. Do not spend time recolouring an SVG to match
the site; it will be repainted anyway.

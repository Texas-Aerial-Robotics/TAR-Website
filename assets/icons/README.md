# Icons

Two kinds of icon live here.

The interface icons (drone, wrench, eye, and so on) were drawn for this site
on a 24×24 grid with a 1.75 stroke.

The `*-icon.svg` files are [Font Awesome
Free](https://fontawesome.com/search?ip=brands) glyphs. Download more from
there and drop them straight in — no editing needed.

[Simple Icons](https://simpleicons.org) is another good source, and it is
CC0:

```bash
curl -o assets/icons/discord-icon.svg \
  https://cdn.jsdelivr.net/npm/simple-icons@latest/icons/discord.svg
```

## How icons get onto a page

They are painted with a CSS mask, which means **one file works in any
colour**. The colour comes from the surrounding text, so the same icon is
dark on light sections and light on dark ones without a second copy.

Using one takes two steps.

**1. Register it** near the bottom of `assets/css/site.css`, in the block
commented `ICON LIBRARY`:

```css
.icon--discord {
  --icon: url("../icons/discord-icon.svg");
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

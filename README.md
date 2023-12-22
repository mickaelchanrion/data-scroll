# DataScroll

[![npm version][npm-version-src]][npm-version-href]
[![npm downloads][npm-downloads-src]][npm-downloads-href]
[![bundle][bundle-src]][bundle-href]
<!-- [![Codecov][codecov-src]][codecov-href] -->

Easily create responsive parallax effect and scroll animations on any element using data attributes.

- 👀 The element only animates while inside the viewport.
- 🎯 The element will have its normal position when in the middle of the viewport.
- 🎨 Animate any property from/to any value.
- 🌈 Apply breakpoint-specific speeds.
- ⚙️ Customize the data-attribute names (hell, even use classes if you want!).
- 🩻 Add helpful markers during development/troubleshooting
- 🚀 Leverages [GSAP](https://gsap.com/docs/v3/GSAP/) and [ScrollTrigger](https://gsap.com/docs/v3/Plugins/ScrollTrigger/) under the hood.

## Usage

Install package:

```sh
# npm
npm install data-scroll

# yarn
yarn add data-scroll

# pnpm
pnpm install data-scroll

# bun
bun install data-scroll
```

Import and instantiate:

```ts
import { useDataScroll } from "data-scroll";

useDataScroll();
```

Play around!
```html
<div data-scroll-speed="md:0.5 lg:0.2">Oowee!</div>
```

## Data attributes

By default, the following data attributes are used:

### `data-scroll-speed`

The speed factor at which the element will move.

> - 1 is the default
> - 0 is ignored
> - 0.5 will make that element go at half-speed
> - 2 will make it go twice as fast.

```html
<div data-scroll-speed="0.5">Oowee!</div>
```

#### Responsive speed

You can specify the speed depending on a breakpoint.

```html
<div data-scroll-speed="md:0.5 lg:0.2">Oowee!</div>
```
> In this example, the speed will be 0.5 starting at medium screens and 0.2 starting at large screens.

#### Clamp

Your element is above the fold and you want it to start from its normal position? Use `clamp`!

```html
<div data-scroll-speed="md:clamp(0.5)">Oowee!</div>
```

> If the element is below the fold, clamp will be ignored.

### `data-scroll-from`

The style from which the element will animate from. See it as a `gsap.from()`

> Beware that the value has to be valid JSON. For functions, use the `getFrom` option.

```html
<div data-scroll-from='{"backgroundColor": "black"}'>Oowee!</div>
```

> In this example, the element will animate from a black background color to its original background color.

### `data-scroll-to`

The style to which the element will animate to. See it as a `gsap.to()`

> Beware that the value has to be valid JSON. For functions, use the `getTo` option.

```html
<div data-scroll-from='{"rotate": 360}'>Oowee!</div>
```

> In this example, the element will rotate to 360 degrees.

### `data-scroll-markers`

Add helpful markers for development/troubleshooting. It's ScrollTrigger's markers option.

```html
<div data-scroll-speed="0.5" data-scroll-markers>Oowee!</div>
```

## Options

### autoStart

If `true`, will automatically find and instantiate elements.
If `false`, you will have to instantiate manually.

- type: `boolean`
- default: `true`

```ts
const dataScroll = useDataScroll({
  autoStart: false,
});

const targets = document.querySelectorAll<HTMLElement>('[data-scroll-speed]')
for (const target of targets) {
  dataScroll.apply(target)
}
```

### screens

The breakpoints used for the `data-scroll-speed` attribute. The defaults are the same as [TailwindCSS](https://tailwindcss.com/docs/breakpoints) but you can customize them.

> Only min-width breakpoints are supported.

- type: `Record<string, string>`
- default:
```ts
{
  sm: '640px',
  md: '768px',
  lg: '1024px',
  xl: '1280px',
  "2xl": '1536px'
}
```

Feel free to have as few or as many screens as you want, naming them in whatever way you’d prefer for your project.

```ts
useDataScroll({
  screens: {
    'tablet': '640px',
    'laptop': '1024px',
    'desktop': '1280px',
  },
});
```

```html
<div data-scroll-speed="tablet:0.5 laptop:0.2 desktop:0.1">Oowee!</div>
```

### selector

The selector used to find elements to instantiate.
- type: `string`
- default: `[data-scroll-speed],[data-scroll-from],[data-scroll-to]`

```ts
useDataScroll({
  selector: '.foo',
});
```

### getSpeed

A function that returns the speed of an element.
- type: `(target: HTMLElement) => string | void`
- default: `(target) => target.dataset.scrollSpeed`

> If you don't want or just can't use the default data-attributes, you can plug your custom logic.

Let's say you want to use classes instead of data-attributes:

```ts
// Extract from a string the contents inside brackets
function extractValue(value: string) {
  const matches = value.match(/\[(.*?)\]/);
  if (matches) {
    return matches[1].replaceAll("_", " ");
  }
  return "";
}

useDataScroll({
  selector: '[class^="scroll-speed"]',
  getSpeed: (target) => {
    // Find the class that starts with "scroll-speed"
    const value = Array.from(target.classList).find((className) => {
      return className.startsWith("scroll-speed"),
    });
    // Extract the value inside the brackets
    if (value) return extractValue(value);
  },
})
```

```html
<div class="scroll-speed-[0.5]">Oowee!</div>
<div class="scroll-speed-[0.05_md:0.02]">Oooooowwweeeee!</div>
```

### getFrom

A function that returns the style to animate the element from.
- type: `(target: HTMLElement) => gsap.TweenVars | void`
- default:
```ts
(target: HTMLElement) => {
  const data = target.dataset.scrollFrom;
  if (data) return JSON.parse(data);
}
```

> You could use predefined animations
```ts
useDataScroll({
  getFrom: (target) => {
    if (target.classList.contains("rotate-360")) {
      return { rotate: 360 };
    }
  }
})
```

```html
<div data-scroll class="rotate-360"></div>
```

### getTo

A function that returns the style to animate the element to. See [getFrom](#getfrom).

## Roadmap

- [x] documentation
- [ ] tests
- [ ] playground
- [ ] Add data-scroll-progress
- [ ] Add hooks for ScrollTrigger like toggleClass, onEnter, onLeave, etc.

## Development

- Clone this repository
- Install latest LTS version of [Node.js](https://nodejs.org/en/)
- Enable [Corepack](https://github.com/nodejs/corepack) using `corepack enable`
- Install dependencies using `pnpm install`
- Run interactive tests using `pnpm dev`

## License

Made with 💛

Published under [MIT License](./LICENSE).

<!-- Badges -->

[npm-version-src]: https://img.shields.io/npm/v/data-scroll?style=flat&colorA=18181B&colorB=F0DB4F
[npm-version-href]: https://npmjs.com/package/data-scroll
[npm-downloads-src]: https://img.shields.io/npm/dm/data-scroll?style=flat&colorA=18181B&colorB=F0DB4F
[npm-downloads-href]: https://npmjs.com/package/data-scroll
[codecov-src]: https://img.shields.io/codecov/c/gh/unjs/data-scroll/main?style=flat&colorA=18181B&colorB=F0DB4F
[codecov-href]: https://codecov.io/gh/unjs/data-scroll
[bundle-src]: https://img.shields.io/bundlephobia/minzip/data-scroll?style=flat&colorA=18181B&colorB=F0DB4F
[bundle-href]: https://bundlephobia.com/result?p=data-scroll

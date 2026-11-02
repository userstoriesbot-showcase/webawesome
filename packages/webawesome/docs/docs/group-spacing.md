---
title: Group Spacing
description: A checkbox group and a radio group side by side, to compare their vertical spacing.
layout: page
unlisted: true
eleventyExcludeFromCollections: true
---

A checkbox group and a radio group with the same three options. The label to list spacing and the spacing between options should match.

```html {.example}
<div style="display: flex; gap: 4rem;">
  <wa-checkbox-group label="Checkbox group">
    <wa-checkbox value="one">One</wa-checkbox>
    <wa-checkbox value="two">Two</wa-checkbox>
    <wa-checkbox value="three">Three</wa-checkbox>
  </wa-checkbox-group>

  <wa-radio-group label="Radio group" value="one">
    <wa-radio value="one">One</wa-radio>
    <wa-radio value="two">Two</wa-radio>
    <wa-radio value="three">Three</wa-radio>
  </wa-radio-group>
</div>
```

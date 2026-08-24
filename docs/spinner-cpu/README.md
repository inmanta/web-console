# Spinner CPU cost

Visual comparison for issue #7228.

| File | What it shows |
| ------------------------ | -------------------------------------------------------------------- |
| `spinner-patternfly.gif` | PatternFly `<Spinner size="sm">`, ~33% of a CPU core while animating |
| `spinner-inline.gif`     | `InlineSpinner`, same size, ~4%                                      |

Both are captured at the size actually used in the UI (12px), scaled 4x for legibility, at
20fps over one full animation cycle (2.8s for PatternFly, 1s for `InlineSpinner`).

The two are deliberately not pixel-identical: PatternFly animates the arc's length via
`stroke-dasharray`/`stroke-dashoffset`, so its arc grows and shrinks. `InlineSpinner` rotates a
fixed-length arc using only `transform`, which is what keeps it on the compositor.

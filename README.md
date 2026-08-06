# HM Jumplinks Navigation

Two WordPress blocks for in-page navigation: **Jumplink** marks a named point in the content, and **Jumplinks Navigation** builds a linked list of every jumplink it can find, with smooth scrolling, scroll spy and a scroll-progress indicator.

The navigation discovers its own items — authors place jumplinks where they want them and the list follows, including anchors nested inside block patterns.

## Blocks

### Jumplink (`hm/jumplink`)

An invisible, zero-height scroll target. Authors give it a **Title** (the label used in the navigation) and a slug, which is derived from the title but can be overridden. An optional per-anchor **scroll offset** is added to the automatically measured sticky-header offset, for sections that need extra clearance.

It saves as a single element:

```html
<div id="how-it-works" data-jumplink-title="How it works" style="--hm-jumplink-offset:24px"></div>
```

### Jumplinks Navigation (`hm/jumplinks-nav`)

Server-rendered from the content being displayed:

- On a singular view, from the post's content.
- On archives, search and 404s, from the resolved block template — so a template can carry a navigation for anchors defined in the template itself.
- In the editor, through the same render, so the preview matches the front end. The site editor passes the template being edited so template previews work too.

`core/pattern` references are expanded (up to ten levels) so anchors inside composed patterns are listed alongside directly authored ones.

The block renders nothing when there are no anchors, and an explanatory placeholder in the editor.

Block styles: **Vertical** (default), **Horizontal**, and **Horizontal (spread)**. The horizontal variants drop the heading and progress marker, and on narrow screens scroll on a single line with faded edges instead of wrapping.

## Installation

Install via Composer (`humanmade/jumplinks-navigation`, tracking the built `release` branch or a tagged version), or:

1. Copy this plugin folder to `wp-content/plugins/`
2. `npm install && npm run build` in the plugin directory
3. Activate the plugin in WordPress admin

## Integration guide

Styling is intentionally minimal, so the blocks pick up the theme's typography and the editor's own color controls rather than imposing a look.

### Custom properties

Set these on `.hm-jumplinks-nav` (or anywhere above it) from `theme.json` or a stylesheet:

Property | Default | Purpose
---- | ---- | ----
`--hm-jumplinks-accent` | `currentColor` | Progress marker and link hover color. Overridden automatically by the block's link color setting.
`--hm-jumplinks-rule-color` | `rgba(0, 0, 0, 0.15)` | The rule beside the vertical list.
`--hm-jumplinks-gap` | `0.5rem` | Space between items.
`--hm-jumplinks-indent` | `1rem` | Space between the rule and the item text.
`--hm-jumplinks-gutter` | `1rem` | The container's inline padding. Used by the mobile horizontal scroller to bleed and fade its edges; set it to match the padding of the bar the navigation sits in.
`--hm-jumplinks-progress` | — | Read-only, `0`–`1`, written by the view script.
`--hm-jumplinks-sticky-offset` | — | Height of the sticky header, on `:root`. See below.

The active item carries `.is-active`; the list is `.hm-jumplinks-nav__list`, its heading `.hm-jumplinks-nav__label`.

### The sticky offset

The view script measures `position: sticky` headers and navs pinned near the top of the viewport and publishes their combined height as `--hm-jumplinks-sticky-offset` on `:root`. Anchors use it in `scroll-margin-top`, and the smooth scroll adds it to the target position, so jumping to a section clears the header.

If your theme already knows its header height, declare the property in CSS on `:root` — the script leaves an author-declared value alone.

### Discovering anchors from elsewhere

Anchors are matched on the `data-jumplink-title` attribute rather than on the block name, so any block or hand-authored markup emitting `id` and `data-jumplink-title` is listed. To add items from outside the content entirely, filter the collected list:

```php
add_filter( 'hm/jumplinks/anchors', function ( array $anchors, string $content ): array {
	$anchors[] = [ 'id' => 'comments', 'title' => __( 'Comments' ) ];
	return $anchors;
}, 10, 2 );
```

## Development

### Build commands

- `npm run start` — development watch build
- `npm run build` — production build
- `npm run lint:js` / `npm run lint:css` — lint source
- `composer phpcs` — PHP coding standards (HM standard)
- `npm run format` — format code using WordPress standards

## Local Environment

This project uses [wp-env](https://developer.wordpress.org/block-editor/reference-guides/packages/packages-env/) to run a lightweight, containerized WordPress instance at [localhost:6278](http://localhost:6278) for testing purposes. The default username for the localhost environment is `admin`, with the password `password`.

Command | Purpose
---- | ----
`npm run env:start` | Start the local environment at http://localhost:6278
`npm run env:stop` | Turn off the local environment
`npm run env:cli -- wp ...` | Run WP-CLI commands within the environment
`npm run env:logs` | Open (and tail) the error logs for the application<sup>&ddagger;</sup>
`npm run env:db` | Open the database in the mysql command line
`npm run env:destroy` | Fully destroy the local environment (deletes container database)

<sup>&ddagger;</sup> This command deliberately filters out GET/OPTIONS/HEAD/POST/PUT access log entries

## Release Process

Merges to `main` automatically [build](https://github.com/humanmade/jumplinks-navigation/actions/workflows/build-release-branch.yml) to the `release` branch. A project may track the `release` branch using [Composer](https://getcomposer.org/) to pull in the latest built beta version.

Commits on the `release` branch may be tagged for installation via [Packagist](https://packagist.org/packages/humanmade/jumplinks-navigation) and marked as releases in GitHub for manual download, using a manually-dispatched ["Tag and Release" GH Actions workflow](https://github.com/humanmade/jumplinks-navigation/actions/workflows/tag-and-release.yml).

To tag a new release:

1. Choose the target version number using [semantic versioning](https://semver.org/).
2. Check out a `prepare-v#.#.#` branch and bump the `Version` in the [plugin.php](./plugin.php) PHPDoc header (and the `PLUGIN_VERSION` constant).
3. Open a pull request titled "Prepare release v#.#.#".
4. Review and merge the "Prepare release" pull request.
5. Wait for the `release` branch to [update](https://github.com/humanmade/jumplinks-navigation/actions/workflows/build-release-branch.yml) with the build that includes the new version number.
6. On the ["Tag and Release" GH Action page](https://github.com/humanmade/jumplinks-navigation/actions/workflows/tag-and-release.yml):
   - Click "Run workflow" in the `workflow_dispatch` banner.
   - Fill out the "Version tag" field with your target version number. This must match the `Version` in `plugin.php`. Use the format `v#.#.#`.
   - Click "Run workflow" to apply the specified tag to the `release` branch.

## License

GPL-2.0-or-later

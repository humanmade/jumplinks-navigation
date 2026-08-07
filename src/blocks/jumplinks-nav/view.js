/* global IntersectionObserver, ResizeObserver */

/**
 * Jumplinks navigation front-end behavior: sticky-offset measurement, smooth
 * scrolling, scroll spy, and scroll progress.
 */

const NAV_SELECTOR = '.hm-jumplinks-nav';
const ITEM_SELECTOR = '.hm-jumplinks-nav__list li';
const ACTIVE_CLASS = 'is-active';
const STICKY_OFFSET_PROPERTY = '--hm-jumplinks-sticky-offset';
const PROGRESS_PROPERTY = '--hm-jumplinks-progress';

// Breathing room below the sticky header so a targeted section doesn't sit
// flush against it after navigating.
const SCROLL_GAP = 20;

/**
 * Read a CSS length custom property from an element, in pixels.
 *
 * @param {Element} element  Element to read from.
 * @param {string}  property Custom property name.
 * @return {number} Value in pixels, or 0 if unset or not a length.
 */
function readPixels( element, property ) {
	return (
		parseFloat(
			window.getComputedStyle( element ).getPropertyValue( property )
		) || 0
	);
}

/**
 * Measure elements stuck to the top of the viewport and publish their combined
 * height as `--hm-jumplinks-sticky-offset` on the document root.
 *
 * Anchors use this in `scroll-margin-top` and the smooth scroll below adds it
 * to the target position, so jumping to a section clears any sticky header.
 */
function updateStickyOffset() {
	let offset = 0;

	document.querySelectorAll( 'header, nav' ).forEach( ( element ) => {
		const styles = window.getComputedStyle( element );
		const top = parseFloat( styles.top );

		// Only count elements pinned near the top; a sticky sidebar or a
		// bottom-anchored bar does not obscure a scroll target.
		if ( styles.position === 'sticky' && top < window.innerHeight / 2 ) {
			offset = Math.max( offset, top + element.offsetHeight );
		}
	} );

	document.documentElement.style.setProperty(
		STICKY_OFFSET_PROPERTY,
		`${ offset }px`
	);
}

/**
 * Start measuring the sticky offset, unless the site has set it itself.
 *
 * A theme that knows its own header height can declare the property in CSS;
 * measuring over the top of that would fight the site's intent.
 */
function initStickyOffset() {
	const declared = window
		.getComputedStyle( document.documentElement )
		.getPropertyValue( STICKY_OFFSET_PROPERTY )
		.trim();

	if ( declared ) {
		return;
	}

	updateStickyOffset();
	new ResizeObserver( updateStickyOffset ).observe(
		document.documentElement
	);
}

/**
 * Scroll to an anchor, accounting for sticky headers and per-anchor offsets.
 *
 * Native fragment navigation is not reliable here: when the link sits inside a
 * `position: sticky` ancestor — as these navigations often do — Chromium
 * ignores `scroll-padding-top`/`scroll-margin-top` and lands the target behind
 * the sticky bars. Computing the position ourselves avoids that.
 *
 * @param {Element} target Anchor element to scroll to.
 */
function scrollToAnchor( target ) {
	const offset =
		readPixels( document.documentElement, STICKY_OFFSET_PROPERTY ) +
		readPixels( target, '--hm-jumplink-offset' ) +
		SCROLL_GAP;

	window.scrollTo( {
		top: target.getBoundingClientRect().top + window.scrollY - offset,
		behavior: 'smooth',
	} );
}

/**
 * Wire up smooth scrolling, scroll spy and progress for one navigation.
 *
 * @param {Element} nav Navigation element.
 */
function initNav( nav ) {
	const links = nav.querySelectorAll( 'a[href^="#"]' );
	const items = nav.querySelectorAll( ITEM_SELECTOR );

	links.forEach( ( link ) => {
		// Capture phase plus stopImmediatePropagation: theme navigation
		// scripts commonly bind their own handler to in-page links and would
		// otherwise trigger a second, unoffset jump after ours.
		link.addEventListener(
			'click',
			( event ) => {
				const target = document.getElementById(
					link.getAttribute( 'href' ).slice( 1 )
				);

				if ( ! target ) {
					return;
				}

				event.preventDefault();
				event.stopImmediatePropagation();
				scrollToAnchor( target );
				window.history.replaceState( null, '', link.hash );
			},
			true
		);
	} );

	const anchors = [];

	links.forEach( ( link, index ) => {
		const element = document.getElementById(
			link.getAttribute( 'href' ).slice( 1 )
		);

		if ( element ) {
			anchors.push( { element, item: items[ index ] } );
		}
	} );

	if ( ! anchors.length ) {
		return;
	}

	// Anchors count as "reached" once they cross the upper third of the
	// viewport, which is also where the observer below starts reporting them.
	const threshold = () => window.innerHeight / 3;

	const setActive = () => {
		let active = null;

		for ( const anchor of anchors ) {
			if ( anchor.element.getBoundingClientRect().top < threshold() ) {
				active = anchor.item;
			}
		}

		items.forEach( ( item ) => item.classList.remove( ACTIVE_CLASS ) );
		active?.classList.add( ACTIVE_CLASS );
	};

	const setProgress = () => {
		const passed = anchors.filter(
			( anchor ) =>
				anchor.element.getBoundingClientRect().top < threshold()
		).length;

		nav.style.setProperty(
			PROGRESS_PROPERTY,
			( passed / anchors.length ).toFixed( 3 )
		);
	};

	const update = () => {
		setActive();
		setProgress();
	};

	// The observer keeps updates cheap while sections enter and leave; the
	// scroll listener covers movement within a single long section.
	const observer = new IntersectionObserver( update, {
		rootMargin: '0px 0px -66% 0px',
		threshold: 0,
	} );

	anchors.forEach( ( { element } ) => observer.observe( element ) );
	window.addEventListener( 'scroll', update, { passive: true } );
	update();
}

function init() {
	initStickyOffset();
	document.querySelectorAll( NAV_SELECTOR ).forEach( initNav );
}

if ( document.readyState === 'loading' ) {
	document.addEventListener( 'DOMContentLoaded', init );
} else {
	init();
}

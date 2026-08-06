<?php
/**
 * Anchor discovery.
 *
 * The navigation block is server-rendered from whatever jumplink anchors exist
 * in the content being displayed. This file resolves *which* content to scan
 * and extracts the anchors from it; the block template only presents them.
 *
 * @package hm-jumplinks-navigation
 */

declare( strict_types=1 );

namespace HM\JumplinksNavigation\Anchors;

use WP_Block;
use WP_Block_Patterns_Registry;

/**
 * Attribute carrying an anchor's human-readable label in saved markup.
 *
 * Anchors are matched on this attribute rather than on the block name, so any
 * block or hand-authored markup that emits it participates in the navigation.
 */
const TITLE_ATTRIBUTE = 'data-jumplink-title';

/**
 * Query argument the editor uses to preview a template's anchors.
 */
const TEMPLATE_QUERY_ARG = 'hm_jumplinks_template';

/**
 * Maximum pattern-expansion depth, guarding against pattern reference cycles.
 */
const MAX_DEPTH = 10;

/**
 * Resolve the block markup to scan for anchors.
 *
 * Anchors normally live in the displayed post's content. On non-singular views
 * (archives, search, 404) there is no such post and the anchors instead live in
 * the resolved block template, which WordPress exposes in a global during
 * template rendering. In the site editor neither is available, so the editor
 * passes the template being edited as a query argument.
 *
 * @param WP_Block $block Block instance, whose context may carry a post ID.
 * @return string Block markup, or an empty string if no source could be resolved.
 */
function get_source_content( WP_Block $block ): string {
	$is_rest = defined( 'REST_REQUEST' ) && REST_REQUEST;
	$post_id = (int) ( $block->context['postId'] ?? 0 );

	if ( ! $post_id && is_singular() ) {
		$post_id = (int) get_queried_object_id();
	}

	if ( $post_id ) {
		$post = get_post( $post_id );
		return $post->post_content ?? '';
	}

	// phpcs:ignore WordPress.Security.NonceVerification.Recommended -- Read-only preview of an already-permission-checked template.
	$template_id = $is_rest ? sanitize_text_field( wp_unslash( $_GET[ TEMPLATE_QUERY_ARG ] ?? '' ) ) : '';

	if ( $template_id ) {
		$template = get_block_template( $template_id );
		return $template->content ?? '';
	}

	if ( ! empty( $GLOBALS['_wp_current_template_content'] ) ) {
		return (string) $GLOBALS['_wp_current_template_content'];
	}

	// The editor renders this block through the REST block renderer, where no
	// template global is set; fall back to whichever post is set up.
	if ( $is_rest ) {
		$post = get_post( get_the_ID() );
		return $post->post_content ?? '';
	}

	return '';
}

/**
 * Collect the anchors present in a block markup string, in document order.
 *
 * @param string $content Block markup.
 * @return array<int, array{id: string, title: string}> Anchor id/title pairs.
 */
function collect( string $content ): array {
	$anchors = collect_from_blocks( parse_blocks( $content ) );

	/**
	 * Filter the anchors gathered for a jumplinks navigation.
	 *
	 * @param array  $anchors Array of `[ 'id' => string, 'title' => string ]`.
	 * @param string $content Block markup the anchors were collected from.
	 */
	// phpcs:ignore WordPress.NamingConventions.ValidHookName.UseUnderscores -- Slashed hook names are HM convention.
	return (array) apply_filters( 'hm/jumplinks/anchors', $anchors, $content );
}

/**
 * Recursively collect anchors from a parsed block tree.
 *
 * Expands `core/pattern` references so anchors nested inside composed patterns
 * appear alongside anchors authored directly in the content.
 *
 * @param array $blocks Parsed block tree.
 * @param int   $depth  Current recursion depth.
 * @return array<int, array{id: string, title: string}> Anchor id/title pairs.
 */
function collect_from_blocks( array $blocks, int $depth = 0 ): array {
	if ( $depth > MAX_DEPTH ) {
		return [];
	}

	$anchors = [];

	foreach ( $blocks as $block ) {
		$anchors = array_merge( $anchors, collect_from_markup( $block['innerHTML'] ?? '' ) );

		if ( ( $block['blockName'] ?? '' ) === 'core/pattern' ) {
			$pattern = WP_Block_Patterns_Registry::get_instance()->get_registered( $block['attrs']['slug'] ?? '' );

			if ( ! empty( $pattern['content'] ) ) {
				$anchors = array_merge( $anchors, collect_from_blocks( parse_blocks( $pattern['content'] ), $depth + 1 ) );
			}

			continue;
		}

		if ( ! empty( $block['innerBlocks'] ) ) {
			$anchors = array_merge( $anchors, collect_from_blocks( $block['innerBlocks'], $depth + 1 ) );
		}
	}

	return $anchors;
}

/**
 * Extract anchors from a single block's own HTML.
 *
 * @param string $html Block markup, excluding inner blocks.
 * @return array<int, array{id: string, title: string}> Anchor id/title pairs.
 */
function collect_from_markup( string $html ): array {
	if ( ! str_contains( $html, TITLE_ATTRIBUTE . '=' ) ) {
		return [];
	}

	preg_match_all( '/<[^>]+' . preg_quote( TITLE_ATTRIBUTE, '/' ) . '=["\'][^"\']+["\'][^>]*>/i', $html, $tags );

	$anchors = [];

	foreach ( $tags[0] as $tag ) {
		if (
			preg_match( '/\bid=["\']([^"\']+)["\']/', $tag, $id )
			&& preg_match( '/' . preg_quote( TITLE_ATTRIBUTE, '/' ) . '=["\']([^"\']+)["\']/', $tag, $title )
		) {
			$anchors[] = [
				'id'    => $id[1],
				'title' => html_entity_decode( $title[1], ENT_QUOTES, 'UTF-8' ),
			];
		}
	}

	return $anchors;
}

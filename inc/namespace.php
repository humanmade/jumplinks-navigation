<?php
/**
 * Plugin bootstrap and block registration.
 *
 * @package hm-jumplinks-navigation
 */

declare( strict_types=1 );

namespace HM\JumplinksNavigation;

/**
 * Attach hooks.
 */
function bootstrap(): void {
	add_action( 'init', __NAMESPACE__ . '\\register_blocks' );
}

/**
 * Register every block built into build/blocks/.
 *
 * The wp-scripts build emits one directory per block, each with a compiled
 * block.json whose file: references resolve relative to the build output.
 */
function register_blocks(): void {
	foreach ( glob( PLUGIN_PATH . '/build/blocks/*/block.json' ) as $block_metadata_file ) {
		register_block_type_from_metadata( $block_metadata_file );
	}
}

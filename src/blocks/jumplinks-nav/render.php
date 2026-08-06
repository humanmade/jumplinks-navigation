<?php
/**
 * Render the jumplinks navigation block.
 *
 * @package hm-jumplinks-navigation
 *
 * @var array    $attributes Block attributes.
 * @var string   $content    Block default content.
 * @var WP_Block $block      Block instance.
 */

use function HM\JumplinksNavigation\Anchors\collect;
use function HM\JumplinksNavigation\Anchors\get_source_content;

$anchors = collect( get_source_content( $block ) );
$is_rest = defined( 'REST_REQUEST' ) && REST_REQUEST;

if ( empty( $anchors ) ) {
	// Nothing to link to: render nothing on the front end, but explain the
	// emptiness in the editor so the block doesn't look broken. Render files
	// are included and their output buffered, so the markup is echoed rather
	// than returned.
	if ( $is_rest ) {
		printf(
			'<nav %1$s aria-hidden="true"><p class="hm-jumplinks-nav__label">%2$s</p><p class="hm-jumplinks-nav__help">%3$s</p></nav>',
			wp_kses_data(
				get_block_wrapper_attributes( [ 'class' => 'hm-jumplinks-nav hm-jumplinks-nav--empty' ] )
			),
			esc_html__( 'Jumplinks Navigation', 'hm-jumplinks-navigation' ),
			esc_html__( 'Add Jumplink blocks to this content — or insert patterns containing them — and they will be listed here.', 'hm-jumplinks-navigation' )
		);
	}

	return;
}

/*
 * Expose the link color as a custom property so the scroll-progress marker and
 * hover states can pick it up. WordPress stores preset selections as
 * "var:preset|color|{slug}" and custom colors verbatim.
 */
$link_color    = $attributes['style']['elements']['link']['color']['text'] ?? '';
$wrapper_attrs = [ 'class' => 'hm-jumplinks-nav' ];

if ( $link_color ) {
	$wrapper_attrs['style'] = preg_match( '/^var:preset\|color\|(.+)$/', $link_color, $preset )
		? '--hm-jumplinks-accent:var(--wp--preset--color--' . sanitize_key( $preset[1] ) . ');'
		: '--hm-jumplinks-accent:' . esc_attr( $link_color ) . ';';
}

$label = $attributes['label'] ?? __( 'Contents', 'hm-jumplinks-navigation' );
?>
<nav <?php echo wp_kses_data( get_block_wrapper_attributes( $wrapper_attrs ) ); ?> aria-label="<?php esc_attr_e( 'In-page navigation', 'hm-jumplinks-navigation' ); ?>">
	<?php if ( $label ) : ?>
		<p class="hm-jumplinks-nav__label"><?php echo esc_html( $label ); ?></p>
	<?php endif; ?>
	<ol class="hm-jumplinks-nav__list">
		<?php foreach ( $anchors as $anchor ) : ?>
			<li>
				<a href="#<?php echo esc_attr( $anchor['id'] ); ?>">
					<?php echo esc_html( $anchor['title'] ); ?>
				</a>
			</li>
		<?php endforeach; ?>
	</ol>
</nav>

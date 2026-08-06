import { InspectorControls, useBlockProps } from '@wordpress/block-editor';
import { PanelBody, TextControl } from '@wordpress/components';
import { __ } from '@wordpress/i18n';

import './editor.scss';

/**
 * Reduce a title to a URL-friendly anchor slug.
 *
 * @param {string} text Source text.
 * @return {string} Slug.
 */
const slugify = ( text ) =>
	text
		.toString()
		.normalize( 'NFKD' )
		.toLowerCase()
		.trim()
		.replace( /\s+/g, '-' )
		.replace( /[^\w-]+/g, '' )
		.replace( /_/g, '-' )
		.replace( /--+/g, '-' )
		.replace( /^-|-$/g, '' );

/**
 * Edit the jumplink's title, slug and scroll offset.
 *
 * The block renders nothing on the front end, so the editor shows a labelled
 * placeholder telling the author what the anchor is and how to link to it.
 *
 * @param {Object}   props               Block props.
 * @param {Object}   props.attributes    Block attributes.
 * @param {Function} props.setAttributes Attribute setter.
 * @return {Element} Editor markup.
 */
export default function Edit( { attributes, setAttributes } ) {
	const { anchorId, title, offset } = attributes;
	const blockProps = useBlockProps( { className: 'hm-jumplink' } );

	/**
	 * Update the title, following it with the slug unless the slug was
	 * edited by hand — regenerating unconditionally would discard a
	 * deliberately chosen slug (and break any links already pointing at it).
	 *
	 * @param {string} value New title.
	 */
	const onChangeTitle = ( value ) => {
		const isDerived = ! anchorId || anchorId === slugify( title || '' );

		setAttributes( {
			title: value,
			...( isDerived ? { anchorId: slugify( value ) } : {} ),
		} );
	};

	return (
		<>
			<div { ...blockProps }>
				<span className="hm-jumplink__title">
					{ title || __( 'Jumplink', 'hm-jumplinks-navigation' ) }
				</span>
				<span className="hm-jumplink__link">
					{ __( 'Links to this point:', 'hm-jumplinks-navigation' ) }{ ' ' }
					<code className="hm-jumplink__value">
						#{ anchorId || '' }
					</code>
				</span>
			</div>
			<InspectorControls>
				<PanelBody
					title={ __( 'Jumplink', 'hm-jumplinks-navigation' ) }
					initialOpen
				>
					<TextControl
						__nextHasNoMarginBottom
						label={ __( 'Title', 'hm-jumplinks-navigation' ) }
						help={ __(
							'The label shown in the jumplinks navigation.',
							'hm-jumplinks-navigation'
						) }
						value={ title || '' }
						onChange={ onChangeTitle }
					/>
					<TextControl
						__nextHasNoMarginBottom
						label={ __(
							'URL-friendly slug',
							'hm-jumplinks-navigation'
						) }
						value={ anchorId || '' }
						onChange={ ( value ) =>
							setAttributes( { anchorId: value } )
						}
					/>
					<TextControl
						__nextHasNoMarginBottom
						type="number"
						label={ __(
							'Extra scroll offset (px)',
							'hm-jumplinks-navigation'
						) }
						help={ __(
							'Added to the automatically measured sticky-header offset for this anchor only.',
							'hm-jumplinks-navigation'
						) }
						value={ offset || '' }
						onChange={ ( value ) =>
							setAttributes( { offset: value || undefined } )
						}
					/>
				</PanelBody>
			</InspectorControls>
		</>
	);
}

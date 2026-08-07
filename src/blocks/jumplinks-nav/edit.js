import { InspectorControls, useBlockProps } from '@wordpress/block-editor';
import { Disabled, PanelBody, TextControl } from '@wordpress/components';
import { useSelect } from '@wordpress/data';
import { __ } from '@wordpress/i18n';
import ServerSideRender from '@wordpress/server-side-render';

import metadata from './block.json';

import './editor.scss';

/**
 * Preview the navigation using the same server render as the front end.
 *
 * The block has no client-side rendering of its own: render.php scans the
 * content for jumplinks and builds the list, so previewing through
 * ServerSideRender keeps the editor honest rather than reimplementing the
 * discovery logic in JavaScript.
 *
 * @param {Object}   props               Block props.
 * @param {Object}   props.attributes    Block attributes.
 * @param {Function} props.setAttributes Attribute setter.
 * @return {Element} Editor markup.
 */
export default function Edit( { attributes, setAttributes } ) {
	// In the site editor there is no post in block context and the resolved
	// template content is not available to the REST renderer. Pass the ID of
	// the template being edited so the preview matches the front end.
	const templateId = useSelect( ( select ) => {
		const editor = select( 'core/editor' );

		if ( ! editor ) {
			return null;
		}

		const postType = editor.getCurrentPostType();

		return postType === 'wp_template' || postType === 'wp_template_part'
			? editor.getCurrentPostId()
			: null;
	}, [] );

	return (
		<>
			<div { ...useBlockProps() }>
				<Disabled>
					<ServerSideRender
						block={ metadata.name }
						attributes={ attributes }
						urlQueryArgs={
							templateId
								? { hm_jumplinks_template: templateId }
								: undefined
						}
					/>
				</Disabled>
			</div>
			<InspectorControls>
				<PanelBody
					title={ __(
						'Jumplinks Navigation',
						'hm-jumplinks-navigation'
					) }
					initialOpen
				>
					<TextControl
						__nextHasNoMarginBottom
						label={ __( 'Heading', 'hm-jumplinks-navigation' ) }
						help={ __(
							'Leave empty to hide the heading above the list.',
							'hm-jumplinks-navigation'
						) }
						value={ attributes.label ?? '' }
						onChange={ ( label ) => setAttributes( { label } ) }
					/>
				</PanelBody>
			</InspectorControls>
		</>
	);
}

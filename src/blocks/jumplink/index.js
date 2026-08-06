/**
 * Jumplink block registration.
 *
 * @see https://developer.wordpress.org/block-editor/reference-guides/block-api/block-registration/
 */
import { registerBlockType } from '@wordpress/blocks';

/**
 * Internal dependencies
 */
import Edit from './edit';
import save from './save';
import metadata from './block.json';

import './style.scss';

registerBlockType( metadata.name, {
	edit: Edit,
	save,
} );

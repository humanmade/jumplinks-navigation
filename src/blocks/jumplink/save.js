/**
 * Save an empty, invisible element carrying the anchor id and its metadata.
 *
 * The title is stored on the element rather than in block attributes alone so
 * the navigation block can discover anchors by scanning saved markup, without
 * depending on this block's name.
 *
 * @param {Object} props            Block props.
 * @param {Object} props.attributes Block attributes.
 * @return {Element} Saved markup.
 */
export default function save( { attributes } ) {
	const { anchorId, title, offset } = attributes;

	return (
		<div
			id={ anchorId || undefined }
			data-jumplink-title={ title || undefined }
			data-jumplink-offset={ offset || undefined }
			style={
				offset ? { '--hm-jumplink-offset': `${ offset }px` } : undefined
			}
		/>
	);
}

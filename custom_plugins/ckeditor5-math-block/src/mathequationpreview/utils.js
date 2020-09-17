import {toWidgetEditable} from "@ckeditor/ckeditor5-widget/src/utils";
import {isMathBlock, isMathEquation} from "../utils";
import katex from "katex";

/**
 * Returns the equationPreview model element from a given mathBlock element. Returns `null` if no equationPreview is found.
 *
 * @param {module:engine/model/element~Element} mathBlockElement
 * @returns {module:engine/model/element~Element|null}
 */
export function getPreviewFromMathBlock( mathBlockElement ) {
	for ( const node of mathBlockElement.getChildren() ) {
		if ( !!node && node.is( 'equationPreview' ) ) {
			return node;
		}
	}
	return null;
}

/**
 * Returns `true` if a given view element is the equation preview
 *
 * @param {module:engine/view/element~Element} viewElement
 * @returns {Boolean}
 */
export function isEquationPreview( viewElement ) {
	return !!viewElement.getCustomProperty( 'equationPreview' );
}

export function isEquationPreviewModel(modelElement) {
	return !!modelElement && modelElement.is( 'equationPreview' );
}

/**
 * For a plain text containing the code (snippet), it returns a document fragment containing
 * model text node with all new lines(\n) stripped , for instance:
 *
 * Input:
 *
 *		"foo()\n
 *		bar()"
 *
 * Output:
 *		<DocumentFragment>
 *			"foo()bar()"
 *		</DocumentFragment>
 *
 * @param {module:engine/model/writer~Writer} writer
 * @param {String} text The raw code text to be converted.
 */
export function rawSnippetTextToModelDocumentFragment( writer, text ) {
	const fragment = writer.createDocumentFragment();
	const newText = text.replace( '\n' ,'');
	writer.append( newText, fragment );
	return fragment;
}

export function activeMathBlock(selection, schema) {
	let mathBlock;
	const selected = selection.getSelectedElement();
	if (isMathBlock(selected)) {
		mathBlock = selected;
	}

	if (!mathBlock) {
		const limitElement = schema.getLimitElement(selection);
		if (isMathEquation(limitElement) && isMathBlock(limitElement.parent)) {
			mathBlock = limitElement.parent;
		}
	}
	return mathBlock;
}

/**
 * Returns a function that creates a preview element for the given {@link module:engine/view/document~Document}.
 *
 *
 * @returns {Function}
 */
export function equationPreviewElementCreator() {
	return (writer, equation) => {
		const preview = writer.createUIElement( 'div', {class: 'math-preview-container'} );
		preview.render = function( domDocument ) {
			const domElement = this.toDomElement( domDocument );
			if(equation){
				domElement.innerHTML = katex.renderToString(equation, {
					displayMode: true,
					throwOnError: false
				});
			}
			return domElement;
		};
		writer.setCustomProperty( 'equationPreview', true, preview );
		return preview;
	};
}

import Plugin from "@ckeditor/ckeditor5-core/src/plugin";
import { debounce } from 'lodash-es';
import {
	activeMathBlock,
	equationPreviewElementCreator,
	getPreviewFromMathBlock, rawSnippetTextToModelDocumentFragment
} from "./utils";
import {isMathBlock, isMathEquation} from "../utils";
import 'katex/dist/katex.min.css'
import './theme/equationpreview.css'
export default class MathEquationPreviewEditing extends Plugin {
	/**
	 * @inheritDoc
	 */
	static get pluginName() {
		return 'MathEquationPreviewEditing';
	}

	init() {

		const editor = this.editor;
		const schema = editor.model.schema;
		const editing = editor.editing;
		this._onEquationChangedDebounce = debounce(this._onEquationChanged, 200);
		editor.model.document.on('change', this._handleDataChange( editor.model));
		// Schema configuration.
		schema.register('equationPreview', {
			allowIn: 'mathBlock',
			allowContentOf: '$root',
			isLimit: true
		});
		// Add preview element to each mathBlock inserted without it.
		editor.model.document.registerPostFixer(writer => this._insertMissingModelEquationPreviewElement(writer));

		// Model to view converter for the editing pipeline.
		const createEquationPreviewForEditing = equationPreviewElementCreator();
		editing.downcastDispatcher.on('insert:equationPreview', equationPreviewModelToView(createEquationPreviewForEditing, editor.model));
		editing.downcastDispatcher.on('remove:equationPreview', equationPreviewModelViewRemoval());


		// Always show equation preview in view when something is inserted in model.
		editing.downcastDispatcher.on(
			'selection',
			this._updateEquationPreviewVisibility(),
			{priority: 'high'}
		);

		// Intercept the clipboard input (paste) when the selection is anchored in the code block and force the clipboard
		// data to be pasted as a single plain text. Otherwise, the code lines will split the code block and
		// "spill out" as separate paragraphs.
		this.listenTo( editor.editing.view.document, 'clipboardInput', ( evt, data ) => {
			const modelSelection = editor.model.document.selection;

			if ( !modelSelection.anchor.parent.is( 'equation' ) ) {
				return;
			}

			const text = data.dataTransfer.getData( 'text/plain' );
			editor.model.change( writer => {
				editor.model.insertContent( rawSnippetTextToModelDocumentFragment( writer, text ), modelSelection );
				evt.stop();
			} );
		} );
	}


	_showHidePreview(viewElement, writer, show = true) {
		if (viewElement) {
			if (show) {
				return showEquationPreview(viewElement, writer);
			} else {
				return hideEquationPreview(viewElement, writer)
			}
		}
		return false;
	}

	_getEquationPreviewFromMathBlock(mapper, mathBlock) {
		const modelEquationPreview = getPreviewFromMathBlock(mathBlock);
		return mapper.toViewElement(modelEquationPreview);
	}

	/**
	 * Returns a converter that fixes preview visibility during the model-to-view conversion.
	 *
	 *
	 * @private
	 * @returns {Function}
	 */
	_updateEquationPreviewVisibility() {
		return (evt, s, conversionApi) => {
			const model = this.editor.model;
			const mapper = this.editor.editing.mapper;
			const viewWriter = conversionApi.writer;
			let mathBlock = activeMathBlock(model.document.selection, model.schema);
			const lastSelectedMathBlock = this._lastSelectedMathBlock;
			if (mathBlock) {
				if (lastSelectedMathBlock === mathBlock) {
					return;
				} else if (lastSelectedMathBlock) {
					this._showHidePreview(this._getEquationPreviewFromMathBlock(mapper, lastSelectedMathBlock), viewWriter, false);
				}
				this._showHidePreview(this._getEquationPreviewFromMathBlock(mapper, mathBlock), viewWriter);
				this._lastSelectedMathBlock = mathBlock;
			} else if (lastSelectedMathBlock) {
				this._showHidePreview(this._getEquationPreviewFromMathBlock(mapper, lastSelectedMathBlock), viewWriter, false);
				this._lastSelectedMathBlock = null;
			}
		};
	}


	_insertMissingModelEquationPreviewElement(writer) {
		const model = this.editor.model;
		const changes = model.document.differ.getChanges();

		const mathBlocksWithoutPreview = [];

		for (const entry of changes) {
			if (entry.type === 'insert' && entry.name !== '$text') {
				const item = entry.position.nodeAfter;
				if (item.is('mathBlock') && !getPreviewFromMathBlock(item)) {
					mathBlocksWithoutPreview.push(item);
				}

				// Check elements with children for nested images.
				if (!item.is('mathBlock') && item.childCount) {
					for (const nestedItem of model.createRangeIn(item).getItems()) {
						if (nestedItem.is('mathBlock') && !getPreviewFromMathBlock(nestedItem)) {
							mathBlocksWithoutPreview.push(nestedItem);
						}
					}
				}
			}
		}

		for (const mathBlock of mathBlocksWithoutPreview) {
			writer.appendElement('equationPreview', mathBlock);
		}

		return !!mathBlocksWithoutPreview.length;
	}

	_onEquationChanged(model, modelElement) {
		function updatePreview(equation) {
			const preview = getPreviewFromMathBlock(modelElement.parent);
			if (preview) {
				model.document.differ.refreshItem(preview);
				model.change(writer => {
					writer.setSelection(model.document.selection);
				});
				this._lastEquation = equation;
			}
		}
		if (modelElement.childCount) {
			const equation = modelElement.getChild(0).data;
			const lastChange = this._lastEquation;
			if(lastChange === equation) {
				return;
			}
			updatePreview.call(this,equation);
		} else {
			const lastChange = this._lastEquation;
			if(lastChange) {
				updatePreview.call(this,'')
			}
		}
	}

	_handleDataChange(model) {
		return (event, batch) => {
			const el = model.schema.getLimitElement(model.document.selection);
			if (el && isMathEquation(el)) {
				this._onEquationChangedDebounce(model, el);
			}
		}
	}

}

// Creates a converter that converts image caption model element to view element.
//
// @private
// @param {Function} elementCreator
// @param {Boolean} [hide=true] When set to `false` view element will not be inserted when it's empty.
// @returns {Function}
function equationPreviewModelToView(elementCreator, model) {
	return (evt, data, conversionApi) => {
		const preview = data.item;
		let equation = '';
		const modelView = preview.previousSibling;
		if(modelView && modelView.is('equation') && modelView.childCount) {
			equation = modelView.getChild(0).data || '';
		}
		if (isMathBlock(preview.parent)) {
			if (!conversionApi.consumable.consume(data.item, 'insert')) {
				return;
			}
			const viewMathBlock = conversionApi.mapper.toViewElement(data.range.start.parent);
			const viewEquationPreview = elementCreator(conversionApi.writer, equation);
			const viewWriter = conversionApi.writer;
			const selectedMathBlock = activeMathBlock(model.document.selection, model.schema);
			// Hide if not selected default.
			if(!selectedMathBlock || (selectedMathBlock && preview.parent !== selectedMathBlock)) {
				viewWriter.addClass('ck-hidden', viewEquationPreview);
			}

			insertViewPreviewAndBind(viewEquationPreview, data.item, viewMathBlock, conversionApi);
		}
	};
}

function equationPreviewModelViewRemoval() {
	return (evt, data, conversionApi) => {
		const viewStart = conversionApi.mapper.toViewPosition( data.position ).getLastMatchingPosition( value => !value.item.is( 'div' ) );
		const viewItem = viewStart.nodeAfter;
		const viewWriter = conversionApi.writer;
		if(viewItem) {
			viewWriter.remove(viewItem);
		}
		evt.stop()
	};
}

// Inserts `viewCaption` at the end of `viewImage` and binds it to `modelCaption`.
//
// @private
// @param {module:engine/view/containerelement~ContainerElement} viewEquationPreview
// @param {module:engine/model/element~Element} modelEquationPreview
// @param {module:engine/view/containerelement~ContainerElement} viewMathBlock
// @param {module:engine/conversion/downcastdispatcher~DowncastConversionApi} conversionApi
function insertViewPreviewAndBind(viewPreview, modelPreview, viewMathBlock, conversionApi) {
	const viewPosition = conversionApi.writer.createPositionAt(viewMathBlock, 'end');
	conversionApi.writer.insert(viewPosition, viewPreview);
	conversionApi.mapper.bindElements(modelPreview, viewPreview);
}


// Hides a given caption in the view if it is empty.
//
// @private
// @param {module:engine/view/containerelement~ContainerElement} equationPreview
// @param {module:engine/view/downcastwriter~DowncastWriter} viewWriter
// @returns {Boolean} Returns `true` if the view was modified.
function hideEquationPreview(equationPreview, viewWriter) {
	if (!equationPreview.hasClass('ck-hidden')) {
		viewWriter.addClass('ck-hidden', equationPreview);
		return true;
	}

	return false;
}

// Shows the caption.
//
// @private
// @param {module:engine/view/containerelement~ContainerElement} equationPreview
// @param {module:engine/view/downcastwriter~DowncastWriter} viewWriter
// @returns {Boolean} Returns `true` if the view was modified.
function showEquationPreview(preview, viewWriter) {
	if (preview.hasClass('ck-hidden')) {
		viewWriter.removeClass('ck-hidden', preview);
		return true;
	}

	return false;
}

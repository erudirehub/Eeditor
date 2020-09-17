import Plugin from "@ckeditor/ckeditor5-core/src/plugin";
import Widget from "@ckeditor/ckeditor5-widget/src/widget";
import MathBlockCommand from "./mathblockcommand";
import { enablePlaceholder } from '@ckeditor/ckeditor5-engine/src/view/placeholder';
import {toWidget, toWidgetEditable} from "@ckeditor/ckeditor5-widget/src/utils";

export default class MathBlockEditing extends Plugin {
	static get requires() {
		return [ Widget ];
	}
	init() {
		this._defineSchema();
		this._defineConverters();

		this.editor.commands.add('insertMathBlock', new MathBlockCommand(this.editor))
	}

	_defineSchema() {
		const schema = this.editor.model.schema;
		schema.register('mathBlock', {
			isObject: true,
			allowWhere: '$block'
		});
		schema.register('equation', {
			allowIn: 'mathBlock',
			allowContentOf: '$block',
			isLimit: true
		});


		// Disallow all attributes on $text inside `codeBlock`.
		schema.addAttributeCheck( context => {
			if ( context.endsWith( 'equation $text' ) ) {
				return false;
			}
		} );
	}

	_defineConverters() {
		const conversion = this.editor.conversion;
		const view = this.editor.editing.view;
		conversion.for('upcast').elementToElement({
			model: 'mathBlock',
			view: {
				name: 'pre',
				classes: 'math-block'
			},
			priority: 'highest'
		});
		conversion.for('dataDowncast').elementToElement({
			model: 'mathBlock',
			view: {
				name: 'pre',
				classes: 'math-block'
			},
			priority: 'highest'
		});

		conversion.for('editingDowncast').elementToElement({
			model: 'mathBlock',
			view: (modelElement, viewWriter) => {
				const  section = viewWriter.createContainerElement('pre', {class: 'math-block'} );
				return toWidget(section, viewWriter, { label: 'math block widget'})
			}
		});

		conversion.for('upcast').elementToElement({
			model: 'equation',
			view: {
				name: 'code',
				classes: 'math-equation'
			},
			priority: 'highest'
		});
		conversion.for('dataDowncast').elementToElement({
			model: 'equation',
			view: {
				name: 'code',
				classes: 'math-equation'
			},
			priority: 'highest'
		});
		conversion.for('editingDowncast').elementToElement({
			model: 'equation',
			view:(modelElement, viewWriter) => {
				const code = viewWriter.createEditableElement('code', { class: 'math-equation'});
				enablePlaceholder( {
					view,
					element: code,
					text: 'latex equation'
				} );
				viewWriter.setCustomProperty( 'mathEquation', true, code );
				return toWidgetEditable(code, viewWriter);
			},
			priority: 'highest'
		});
	}
}

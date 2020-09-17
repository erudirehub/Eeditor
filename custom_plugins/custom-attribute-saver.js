import Plugin from "@ckeditor/ckeditor5-core/src/plugin";
import model from "@ckeditor/ckeditor5-ui/src/model";

export default class CustomAttributeSaver extends Plugin {
	init() {

	}

	afterInit() {
		const editor = this.editor;
		// Define custom attributes that should be preserved.
		this.setupCustomAttributeConversion('h2', 'heading1', 'data-uid', editor);
		this.setupCustomAttributeConversion('h3', 'heading2', 'data-uid', editor);
		this.setupCustomAttributeConversion('p', 'paragraph', 'data-uid', editor);
		this.setupCustomAttributeConversion('blockquote', 'blockQuote', 'data-uid', editor);
		this.setupCustomAttributeConversion('li', 'listItem', 'data-uid', editor);
		this.setupCustomAttributeConversion('code', 'codeBlock', 'data-uid', editor);
		this.setupCustomAttributeConversion('code', 'equation', 'data-uid', editor);

		this.setupCustomAttributeConversion('figure', 'media', 'data-uid', editor);
		this.setupCustomAttributeConversion('figure', 'media', 'data-content', editor);
		this.setupCustomAttributeConversion('figure', 'media', 'data-collection', editor);
		this.setupCustomAttributeConversion('figure', 'media', 'data-context-uid', editor);
		this.setupCustomAttributeConversion('figure', 'media', 'data-content-uid', editor);
		this.setupCustomAttributeConversion('figure', 'media', 'data-user-uid', editor);
		this.setupCustomAttributeConversion('figure', 'media', 'data-response', editor);
		this.setupCustomAttributeConversion('figure', 'media', 'data-video-src', editor);
		this.setupCustomAttributeConversion('figure', 'media', 'data-storage-uid', editor);
		this.setupCustomAttributeConversion('figure', 'media', 'data-uploader-uid', editor);
		this.setupCustomAttributeConversion('figure', 'media', 'data-width', editor);
		this.setupCustomAttributeConversion('figure', 'media', 'data-height', editor);
		this.setupCustomAttributeConversion('figure', 'media', 'data-item-id', editor);
		this.setupCustomAttributeConversion('figure', 'media', 'data-start', editor);
		this.setupCustomAttributeConversion('figure', 'media', 'data-end', editor);
		this.setupCustomAttributeConversion('figure', 'media', 'data-video', editor);
		this.setupCustomAttributeConversion('figure', 'media', 'data-thumbnail-url', editor);
		this.setupCustomAttributeConversion('figure', 'media', 'data-video-duration', editor);

		this.setupCustomAttributeConversion('figure', 'image', 'data-uid', editor);
		this.setupCustomAttributeConversion('figure', 'image', 'data-storage-uid', editor);
		this.setupCustomAttributeConversion('figure', 'image', 'data-uploader-uid', editor);
		this.setupCustomAttributeConversion('figure', 'image', 'data-width', editor);
		this.setupCustomAttributeConversion('figure', 'image', 'data-height', editor);

	}

	/**
	 * Sets up a conversion for a custom attribute on view elements contained inside a <figure>.
	 *
	 * This method:
	 * - Adds proper schema rules.
	 * - Adds an upcast converter.
	 * - Adds a downcast converter.
	 */
	setupCustomAttributeConversion(viewElementName, modelElementName, viewAttribute, editor) {
		// Extend the schema to store an attribute in the model.
		const modelAttribute = `custom-${viewAttribute}`;

		editor.model.schema.extend(modelElementName, {allowAttributes: [modelAttribute]});
		editor.conversion.for('upcast').add(this.upcastAttribute(viewElementName, viewAttribute, modelAttribute));
		editor.conversion.for('downcast').add(this.downcastAttribute(modelElementName, viewElementName, viewAttribute, modelAttribute));
	}


	upcastAttribute(viewElementName, viewAttribute, modelAttribute) {
		return dispatcher => dispatcher.on(`element:${viewElementName}`, (evt, data, conversionApi) => {
			const viewItem = data.viewItem;
			const modelRange = data.modelRange;
			const modelElement = modelRange && modelRange.start.nodeAfter;
			if (!modelElement) {
				return;
			}
			if(modelElement.parent.name !== '$root') {
				return;
			}
			conversionApi.writer.setAttribute(modelAttribute, viewItem.getAttribute(viewAttribute), modelElement);
		});
	}

	/**
	 * Returns the custom attribute downcast converter.
	 */
	downcastAttribute(modelElementName, viewElementName, viewAttribute, modelAttribute) {
		return dispatcher => dispatcher.on(`insert:${modelElementName}`, (evt, data, conversionApi) => {
			const modelElement = data.item;
			const viewElement = conversionApi.mapper.toViewElement(modelElement);
			if(modelElementName === 'paragraph' && modelElement.parent.name !== '$root') {
				return;
			}
			if(modelElementName === 'code' && viewElement.parent.name !== 'pre') {
				return;
			}
			let modelAttrValue = modelElement.getAttribute(modelAttribute);
			if (!modelAttrValue && viewAttribute === 'data-uid') {
				const uuid = this.uuidv4();
				conversionApi.writer.setAttribute(modelAttribute, uuid, modelElement);
				modelAttrValue = uuid;
			}
			if (!modelAttrValue) {
				return;
			}
			conversionApi.writer.setAttribute(viewAttribute, modelAttrValue, viewElement);
		});
	}


	uuidv4() {
		return ([1e7] + -1e3 + -4e3 + -8e3 + -1e11).replace(/[018]/g, c =>
			(c ^ crypto.getRandomValues(new Uint8Array(1))[0] & 15 >> c / 4).toString(16)
		);
	}
}

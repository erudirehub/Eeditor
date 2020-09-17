import Plugin from "@ckeditor/ckeditor5-core/src/plugin";
import MathEquationPreviewEditing from "./mathequationpreview/mathequationpreviewediting";

export default class MathEquationPreview extends Plugin {
	/**
	 * @inheritDoc
	 */
	static get requires() {
		return [ MathEquationPreviewEditing ];
	}

	/**
	 * @inheritDoc
	 */
	static get pluginName() {
		return 'MathEquationPreview';
	}
}

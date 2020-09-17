import Plugin from "@ckeditor/ckeditor5-core/src/plugin";
import MathBlockUI from "./mathblockui";
import MathBlockEditing from "./mathblockediting";

export default class MathBlock extends Plugin {
	/**
	 * @inheritDoc
	 */
	static get requires() {
		return [ MathBlockEditing, MathBlockUI ];
	}
	/**
	 * @inheritDoc
	 */
	static get pluginName() {
		return 'MathBlock';
	}
}

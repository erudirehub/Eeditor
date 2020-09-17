import Command from "@ckeditor/ckeditor5-core/src/command";

export default class MathBlockCommand extends Command {

	refresh() {
		const model = this.editor.model;
		const selection = model.document.selection;
		const allowedIn = model.schema.findAllowedParent(selection.getFirstPosition(), 'mathBlock');
		this.isEnabled = allowedIn != null;
	}

	execute() {
		this.editor.model.change( writer => {
			this.editor.model.insertContent(this._createMathBlock(writer))
		});
	}

	_createMathBlock(writer) {
		const mathBlock = writer.createElement('mathBlock');
		const equation = writer.createElement ('equation');
		writer.append(equation, mathBlock);
		return mathBlock;
	}
}

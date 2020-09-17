import Plugin from "@ckeditor/ckeditor5-core/src/plugin";
import mathBlockIcon from '../theme/icons/math-formula.svg';
import '../theme/mathblock.css';
import ButtonView from "@ckeditor/ckeditor5-ui/src/button/buttonview";

export default class MathBlockUI extends Plugin {
	init() {
		const editor = this.editor;
		const t = editor.t;
		const componentFactory = editor.ui.componentFactory;

		componentFactory.add('mathBlock', locale => {
			const command = editor.commands.get( 'insertMathBlock');
			const buttonView = new ButtonView(locale);
			buttonView.set( {
				label: t( 'Insert math block' ),
				tooltip: true,
				icon: mathBlockIcon,
				isToggleable: true
			} );

			buttonView.bind('isEnabled').to(command);
			buttonView.on( 'execute', () => {
				editor.execute( 'insertMathBlock');
				editor.editing.view.focus();
			});

			return buttonView;
		});
	}
}

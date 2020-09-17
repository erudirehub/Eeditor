import Plugin from "@ckeditor/ckeditor5-core/src/plugin";
import getLastTextLine from '@ckeditor/ckeditor5-typing/src/utils/getlasttextline';
import InlineAutoformatEditing from "@ckeditor/ckeditor5-autoformat/src/inlineautoformatediting";
import link from "@ckeditor/ckeditor5-link/src/link";
export default class AutoLink extends Plugin {
	/**
	 * @inheritDoc
	 */
	static get pluginName() {
		return 'AutoLink';
	}
	/**
	 * @inheritDoc
	 */
	afterInit() {
		this._addAutoLinkformats();
	}

	_addAutoLinkformats() {
		const commands = this.editor.commands;
		if ( commands.get( 'link' ) ) {
			const editor = this.editor;
			const formatCallback = getCallbackFunctionForAutoLink(editor);
			editor.model.document.on( 'change', ( evt, batch ) => {
				if ( batch.type === 'transparent' ) {
					return;
				}

				const model = editor.model;
				const selection = model.document.selection;

				// Do nothing if selection is not collapsed.
				if ( !selection.isCollapsed ) {
					return;
				}

				const changes = Array.from( model.document.differ.getChanges() );
				const entry = changes[ 0 ];

				// Typing is represented by only a single change.
				if ( changes.length !== 1 || entry.type !== 'insert' || entry.name !== '$text' || entry.length !== 1 ) {
					return;
				}
				const focus = selection.focus;
				const block = focus.parent;
				const { text, range } = getLastTextLine( model.createRange( model.createPositionAt( block, 0 ), focus ), model );
				const testOutput = formatCheckCallback( text );
				const rangesToFormat = testOutputToRanges( range.start, testOutput, model );
				if ( !(rangesToFormat.length) ) {
					return;
				}

				// Use enqueueChange to create new batch to separate typing batch from the auto-format changes.
				model.enqueueChange( writer => {
					// Apply format.
					formatCallback( writer, rangesToFormat );
				} );
			} );
		}
	}
}
function formatCheckCallback(text) {
	let result;
	const urls = [];
	const urlPositions = [];
	const regExp = new RegExp(URL_PATTERN_ALT.source, "gim");
	do {
		result = regExp.exec(text);
		if(result){
			const start = result.index;
			const end = regExp.lastIndex;
			urlPositions.push([start, end]);
			const url = text.substring(start, end);
			urls.push(url);
		}
	}while (result);
	return {
		urls,
		urlPositions
	};
}
function getCallbackFunctionForAutoLink(editor) {
	return ( writer, linkRanges ) => {
		const command = editor.commands.get( 'link');
		if ( !command.isEnabled ) {
			return false;
		}
		console.log('Url ranges => ', linkRanges);
		const rangesToFormat = linkRanges.map( linkRange => linkRange.range);
		const validRanges = editor.model.schema.getValidRanges( rangesToFormat, 'linkHref' );

		function findUrlForRange(range) {
			for (const linkRange of linkRanges) {
				if(linkRange.range.start.offset === range.start.offset && linkRange.range.end.offset === range.end.offset){
					return linkRange.url;
				}
			}
			return '';
		}

		let linkSet = false;
		for ( const range of validRanges ) {
			let linkExist = false;
			const href = findUrlForRange(range, linkRanges);
			if (!href) {
				continue;
			}
			for(const item of range.getItems({
				shallow: true
			})){
				const exist = item.textNode.getAttribute('linkHref');
				if(exist === href){
					linkExist = true;
				}
			}
			if(!linkExist){
				linkSet = true;
				writer.setAttribute( 'linkHref', href, range );
				writer.setAttribute('linkIsExternal', true, range)
			}
		}
		if(!linkSet) return;
		// After applying attribute to the text, remove given attribute from the selection.
		// This way user is able to type a text without attribute used by auto formatter.
		writer.removeSelectionAttribute( 'linkHref');
		writer.removeSelectionAttribute('linkIsExternal')
	};
}
function testOutputToRanges( start, output, model ) {
	const linkRanges = [];
	for(let i = 0; i < output.urlPositions.length; i++){
		if( output.urlPositions[i][0] && output.urlPositions[i][1]){
			linkRanges.push({
				range: model.createRange( start.getShiftedBy( output.urlPositions[i][ 0 ] ), start.getShiftedBy( output.urlPositions[i][ 1 ] ) ),
				url: output.urls[i]
			})
		}
	}
	return linkRanges;
}
const URL_PATTERN = "(?:\\b|^)(((?:(http|https|Http|Https|rtsp|Rtsp):\\/\\/(?:(?:[a-zA-Z0-9\\$\\-\\_\\.\\+\\!\\*\\'\\(\\)"
	+ "\\,\\;\\?\\&\\=]|(?:\\%[a-fA-F0-9]{2})){1,64}(?:\\:(?:[a-zA-Z0-9\\$\\-\\_"
	+ "\\.\\+\\!\\*\\'\\(\\)\\,\\;\\?\\&\\=]|(?:\\%[a-fA-F0-9]{2})){1,25})?\\@)?)?"
	+ "((?:(?:[a-zA-Z0-9][a-zA-Z0-9\\-]{0,64}\\.)+"   // named host
	+ "(?:"   // plus top level domain
	+ "(?:aero|arpa|asia|a[cdefgilmnoqrstuwxz])"
	+ "|(?:biz|b[abdefghijmnorstvwyz])"
	+ "|(?:cat|com|coop|c[acdfghiklmnoruvxyz])"
	+ "|d[ejkmoz]"
	+ "|(?:edu|e[cegrstu])"
	+ "|f[ijkmor]"
	+ "|(?:gov|g[abdefghilmnpqrstuwy])"
	+ "|h[kmnrtu]"
	+ "|(?:info|int|i[delmnoqrst])"
	+ "|(?:jobs|j[emop])"
	+ "|k[eghimnrwyz]"
	+ "|l[abcikrstuvy]"
	+ "|(?:mil|mobi|museum|m[acdghklmnopqrstuvwxyz])"
	+ "|(?:name|net|n[acefgilopruz])"
	+ "|(?:org|om)"
	+ "|(?:pro|p[aefghklmnrstwy])"
	+ "|qa"
	+ "|r[eouw]"
	+ "|s[abcdeghijklmnortuvyz]"
	+ "|(?:tel|travel|t[cdfghjklmnoprtvwz])"
	+ "|u[agkmsyz]"
	+ "|v[aceginu]"
	+ "|w[fs]"
	+ "|y[etu]"
	+ "|z[amw]))"
	+ "|(?:(?:25[0-5]|2[0-4]" // or ip address
	+ "[0-9]|[0-1][0-9]{2}|[1-9][0-9]|[1-9])\\.(?:25[0-5]|2[0-4][0-9]"
	+ "|[0-1][0-9]{2}|[1-9][0-9]|[1-9]|0)\\.(?:25[0-5]|2[0-4][0-9]|[0-1]"
	+ "[0-9]{2}|[1-9][0-9]|[1-9]|0)\\.(?:25[0-5]|2[0-4][0-9]|[0-1][0-9]{2}"
	+ "|[1-9][0-9]|[0-9])))"
	+ "(?:\\:\\d{1,5})?)" // plus option port number
	+ "(\\/(?:(?:[a-zA-Z0-9\\;\\/\\?\\:\\@\\&\\=\\#\\~"  // plus option query params
	+ "\\-\\.\\+\\!\\*\\'\\(\\)\\,\\_])|(?:\\%[a-fA-F0-9]{2}))*)?"
	+ ")(?:\\b|$)";

const URL_PATTERN_ALT = /(?:\b|^)(?:(?:(?:https?|ftp):)?\/\/)(?:\S+(?::\S*)?@)?(?:(?!(?:10|127)(?:\.\d{1,3}){3})(?!(?:169\.254|192\.168)(?:\.\d{1,3}){2})(?!172\.(?:1[6-9]|2\d|3[0-1])(?:\.\d{1,3}){2})(?:[1-9]\d?|1\d\d|2[01]\d|22[0-3])(?:\.(?:1?\d{1,2}|2[0-4]\d|25[0-5])){2}(?:\.(?:[1-9]\d?|1\d\d|2[0-4]\d|25[0-4]))|(?:(?:[a-z\u00a1-\uffff0-9]-*)*[a-z\u00a1-\uffff0-9]+)(?:\.(?:[a-z\u00a1-\uffff0-9]-*)*[a-z\u00a1-\uffff0-9]+)*(?:\.(?:[a-z\u00a1-\uffff]{2,})))(?::\d{2,5})?(?:[/?#]\S*)?(?:\b|$)/;

/**
 * @license Copyright (c) 2003-2020, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

// The editor creator to use.
import ClassicEditorBase from '@ckeditor/ckeditor5-editor-classic/src/classiceditor';
import DecoupledEditorBase from '@ckeditor/ckeditor5-editor-classic/src/decouplededitor';

import Essentials from '@ckeditor/ckeditor5-essentials/src/essentials';
import AutoLink from "../custom_plugins/autolink/autolink";
import Autoformat from '@ckeditor/ckeditor5-autoformat/src/autoformat';
import Bold from '@ckeditor/ckeditor5-basic-styles/src/bold';
import Code from '@ckeditor/ckeditor5-basic-styles/src/code';
import Italic from '@ckeditor/ckeditor5-basic-styles/src/italic';
import BlockQuote from '@ckeditor/ckeditor5-block-quote/src/blockquote';
import BlockQuoteStyle from "@ckeditor/ckeditor5-block-quote/src/blockquotestyle";
import BlockQuoteToolbar from "@ckeditor/ckeditor5-block-quote/src/blockquotestyle/blockquotetoolbar";
import Heading from '@ckeditor/ckeditor5-heading/src/heading';
import HeadingButtonsUI from "@ckeditor/ckeditor5-heading/src/headingbuttonsui";
import Image from '@ckeditor/ckeditor5-image/src/image';
import ImageCaption from '@ckeditor/ckeditor5-image/src/imagecaption';
import ImageStyle from '@ckeditor/ckeditor5-image/src/imagestyle';
import ImageToolbar from '@ckeditor/ckeditor5-image/src/imagetoolbar';
import ImageUpload from '@ckeditor/ckeditor5-image/src/imageupload';
import CodeBlock from '@ckeditor/ckeditor5-code-block/src/codeblock';
import FontFamily from '@ckeditor/ckeditor5-font/src/fontfamily';
import FontBackgroundColor from '@ckeditor/ckeditor5-font/src/fontbackgroundcolor';
import PageBreak from '@ckeditor/ckeditor5-page-break/src/pagebreak';
import Mention from '@ckeditor/ckeditor5-mention/src/mention';
import Strikethrough from '@ckeditor/ckeditor5-basic-styles/src/strikethrough';
import Superscript from '@ckeditor/ckeditor5-basic-styles/src/superscript';
import Subscript from '@ckeditor/ckeditor5-basic-styles/src/subscript';
import Title from '@ckeditor/ckeditor5-heading/src/title';
import Underline from '@ckeditor/ckeditor5-basic-styles/src/underline';
import WordCount from '@ckeditor/ckeditor5-word-count/src/wordcount';
import Indent from '@ckeditor/ckeditor5-indent/src/indent';
import Link from '@ckeditor/ckeditor5-link/src/link';
import List from '@ckeditor/ckeditor5-list/src/list';
import MediaEmbed from '@ckeditor/ckeditor5-media-embed/src/mediaembed';
import MathBlock from "../custom_plugins/ckeditor5-math-block/src/mathblock";
import MathEquationPreview from "../custom_plugins/ckeditor5-math-block/src/mathequationpreview";
import Paragraph from '@ckeditor/ckeditor5-paragraph/src/paragraph';
import PasteFromOffice from '@ckeditor/ckeditor5-paste-from-office/src/pastefromoffice';
import CustomAttributeSaver from "../custom_plugins/custom-attribute-saver";

class ClassicEditor extends ClassicEditorBase {}
class CommentEditor extends DecoupledEditorBase {}
import '../custom_plugins/custom.css';
// Plugins to include in the build.
ClassicEditor.builtinPlugins = [
	Essentials,
	Autoformat,
	Bold,
	Code,
	CodeBlock,
	BlockQuote,
	BlockQuoteStyle,
	BlockQuoteToolbar,
	FontFamily,
	FontBackgroundColor,
	Heading,
	HeadingButtonsUI,
	Italic,
	Image,
	ImageCaption,
	ImageStyle,
	ImageToolbar,
	ImageUpload,
	Indent,
	Link,
	List,
	Mention,
	MediaEmbed,
	PasteFromOffice,
	PageBreak,
	Paragraph,
	Strikethrough,
	Superscript,
	Subscript,
	Title,
	Underline,
	WordCount,
	CustomAttributeSaver,
	MathBlock,
	MathEquationPreview
];

// Editor configuration.
ClassicEditor.defaultConfig = {
	toolbar: {
		items: [
			'heading1',
			'heading2',
			'pageBreak',
			'blockQuote',
			'bulletedList',
			'numberedList',
			'indent',
			'outdent',
			'|',
			'bold',
			'italic',
			'underline',
			'strikethrough',
			'superscript',
			'subscript',
			'code',
			'link',
			'|',
			'codeBlock',
			'imageUpload',
			'mediaEmbed',
			'mathBlock',
			'|',
			'undo',
			'redo',
		]
	},
	heading: {
		options: [
			{model: 'heading1', view: 'h2', title: 'Main heading', class: 'ck-heading_heading1'},
			{model: 'heading2', view: 'h3', title: 'Sub heading', class: 'ck-heading_heading2'},
		]
	},
	image: {
		toolbar: [
			'imageTextAlternative'
		]
	},
	// This value must be kept in sync with the language defined in webpack.config.js.
	language: 'en'
};

// Plugins to include in the build.
CommentEditor.builtinPlugins = [
	Essentials, Mention, Link, Paragraph, AutoLink, WordCount
];

// Editor configuration.
CommentEditor.defaultConfig = {
	// This value must be kept in sync with the language defined in webpack.config.js.
	language: 'en'
};

export default {
	ClassicEditor, CommentEditor
};

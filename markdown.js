'use strict';

const
	MarkdownIt = require('markdown-it');

const md = new MarkdownIt({
	// Want to enable, but need a blacklist
	//html: true,
	highlight(str, lang) {
		if(lang && hl.getLanguage(lang)) {
			try {
				return `<pre><code class="lang-${lang}">` +
					hl.highlight(lang, str, true).value +
				"</code></pre>"
			}
			catch(e) {}
		}
		return `<pre><code class="lang-${lang}">` +
			md.utils.escapeHtml(str) + "</code></pre>";
	}
});

module.exports = md;

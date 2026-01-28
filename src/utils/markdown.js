import { marked } from 'marked';
import DOMPurify from 'dompurify';

const escapeHtml = (input = '') =>
  input
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');

const linkifyPlainText = (input = '') => {
  const escaped = escapeHtml(input);
  const urlRegex = /((https?:\/\/|www\.)[^\s<]+)/g;

  return escaped.replace(urlRegex, (match) => {
    let cleaned = match;
    let trailing = '';

    while (/[)\].,!?:;]$/.test(cleaned)) {
      trailing = cleaned.slice(-1) + trailing;
      cleaned = cleaned.slice(0, -1);
    }

    const href = cleaned.startsWith('http://') || cleaned.startsWith('https://')
      ? cleaned
      : `https://${cleaned}`;

    return `<a class="link-button" href="${href}" target="_blank" rel="noopener noreferrer">${cleaned}</a>${trailing}`;
  });
};

marked.setOptions({
  breaks: true,
  gfm: true,
  mangle: false,
  headerIds: false
});

export const renderMarkdown = (input = '') => {
  const html = marked.parse(input);
  return DOMPurify.sanitize(html);
};

export const renderMarkdownInline = (input = '') => {
  const html = marked.parseInline(input);
  return DOMPurify.sanitize(html);
};

export const renderPlainTextWithLinks = (input = '') => {
  const html = linkifyPlainText(input);
  return DOMPurify.sanitize(html, { ADD_ATTR: ['target', 'rel', 'class'] });
};

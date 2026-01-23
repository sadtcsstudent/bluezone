import { marked } from 'marked';
import DOMPurify from 'dompurify';

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

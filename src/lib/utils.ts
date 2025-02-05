import { clsx, type ClassValue } from 'clsx';
import rehypeKatex from 'rehype-katex';
import rehypeStringify from 'rehype-stringify';
import remarkGfm from 'remark-gfm';
import remarkMath from 'remark-math';
import remarkParse from 'remark-parse';
import remarkRehype from 'remark-rehype';
import { twMerge } from 'tailwind-merge';
import { unified } from 'unified';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function markdownToHtml(markdown: string) {
  const result = unified()
    .use(remarkParse)
    .use(remarkMath)
    .use(remarkGfm)
    .use(remarkRehype)
    .use(rehypeKatex)
    .use(rehypeStringify)
    .processSync(markdown);

  return result.toString();
}

export function debounce(func: () => void, delay: number = 300) {
  let timeout: NodeJS.Timeout;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return function (...args: any[]) {
    clearTimeout(timeout);
    // @ts-expect-error basic debounce implementation
    timeout = setTimeout(() => func.apply(this, args), delay);
  };
}

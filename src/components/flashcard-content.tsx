import { markdownToHtml } from '@/lib/utils';

export default function FlashcardContent({ content }: { content: string }) {
  return (
    <article
      className='prose min-h-96 h-full flex-1 p-2 rounded-xl flex flex-col items-center justify-center sm:shadow-xs w-full sm:border animate-in fade-in'
      dangerouslySetInnerHTML={{
        __html: markdownToHtml(content),
      }}
    ></article>
  );
}

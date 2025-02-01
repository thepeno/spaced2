import { markdownToHtml } from '@/lib/utils';

export default function FlashcardContent({ content }: { content: string }) {
  return (
    <article
      className='prose h-96 flex-1 border border-1 p-2 rounded-sm flex flex-col items-center justify-center shadow-xs w-full'
      dangerouslySetInnerHTML={{
        __html: markdownToHtml(content),
      }}
    ></article>
  );
}

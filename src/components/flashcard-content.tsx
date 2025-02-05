import { markdownToHtml } from '@/lib/utils';

export default function FlashcardContent({ content }: { content: string }) {
  return (
    // We can't use justify-center here because it prevents scrolling to the top of the container
    // when the container overflows.
    // See this https://stackoverflow.com/questions/33454533/cant-scroll-to-top-of-flex-item-that-is-overflowing-container

    // To solve this we add 2 pseudo elements that take up the remaining height
    // and only use `items-center` to center horizontally.
    <article
      className='prose h-96 overflow-y-auto flex flex-col flex-1 p-2 rounded-xl sm:shadow-xs w-full sm:border animate-in fade-in before:content-[""] after:content-[""] before:flex-1 after:flex-1 items-center'
      dangerouslySetInnerHTML={{
        __html: markdownToHtml(content),
      }}
    ></article>
  );
}

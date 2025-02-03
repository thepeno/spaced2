import { BasicStats } from '@/components/stats/basic';
import { Heatmap } from '@/components/stats/heatmap';
import { TimeOfDayChart } from '@/components/stats/radial-time-of-day';
import { RatingPieChart } from '@/components/stats/rating-pie-chart';
import { ReviewChart } from '@/components/stats/review-chart';
import { db } from '@/lib/db/persistence';
import { processReviewLogOperations } from '@/lib/review';
import { useLiveQuery } from 'dexie-react-hooks';

export default function StatsRoute() {
  const allReviewLogOperations =
    useLiveQuery(() => db.reviewLogOperations.toArray()) ?? [];
  const reviewLogs = processReviewLogOperations(allReviewLogOperations);

  return (
    <div className='flex flex-col h-full col-start-1 col-end-13 xl:col-start-3 xl:col-end-11 md:px-24 pb-6 gap-2 animate-fade-in'>
      <BasicStats reviewLogs={reviewLogs} />
      <Heatmap reviewLogs={reviewLogs} />
      <div className='flex sm:flex-row flex-col gap-2 w-full'>
        <RatingPieChart reviewLogs={reviewLogs} />
        <TimeOfDayChart reviewLogs={reviewLogs} />
      </div>
      <ReviewChart reviewLogs={reviewLogs} />
    </div>
  );
}

import { BasicStats } from '@/components/stats/basic';
import EmptyStats from '@/components/stats/empty';
import { Heatmap } from '@/components/stats/heatmap';
import { TimeOfDayChart } from '@/components/stats/radial-time-of-day';
import { RatingPieChart } from '@/components/stats/rating-pie-chart';
import { ReviewChart } from '@/components/stats/review-chart';
import { TimeBarChart } from '@/components/stats/time-bar-chart';
import { db } from '@/lib/db/persistence';
import { processReviewLogOperations } from '@/lib/review/review';
import { useLiveQuery } from 'dexie-react-hooks';
import { ArrowLeft, Loader2 } from 'lucide-react';
import { Link } from 'react-router';
import { useState, useEffect, useRef } from 'react';

export default function StatsRoute() {
  const [showHeaderBorder, setShowHeaderBorder] = useState(false);
  const [showContentBottomBorder, setShowContentBottomBorder] = useState(true);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  const allReviewLogOperations = useLiveQuery(() =>
    db.reviewLogOperations.toArray()
  );

  const reviewLogs = allReviewLogOperations ? processReviewLogOperations(allReviewLogOperations) : [];
  const hasStats = reviewLogs.length > 0;

  // Handle scroll events for border visibility
  useEffect(() => {
    const scrollContainer = scrollContainerRef.current;
    if (!scrollContainer || !allReviewLogOperations) return;

    const handleScroll = () => {
      const { scrollTop, scrollHeight, clientHeight } = scrollContainer;
      
      // Show header border when scrolled down
      setShowHeaderBorder(scrollTop > 0);
      
      // Hide bottom border when at the bottom
      const isAtBottom = scrollTop + clientHeight >= scrollHeight - 1;
      setShowContentBottomBorder(!isAtBottom);
    };

    scrollContainer.addEventListener('scroll', handleScroll);
    // Initial check
    handleScroll();

    return () => scrollContainer.removeEventListener('scroll', handleScroll);
  }, [allReviewLogOperations, hasStats]); // Re-run when data changes

  if (!allReviewLogOperations) {
    return (
      <div className='flex flex-col h-full col-start-1 col-end-13 gap-2 px-5 pb-2 pt-6 xl:col-start-3 xl:col-end-11 md:px-24 '>
        <div className='flex flex-col h-full min-h-96 justify-center items-center'>
          <Loader2 className='w-16 h-16 animate-spin text-primary' />
        </div>
      </div>
    );
  }

  return (
    <div className='flex flex-col h-full col-start-1 col-end-13 xl:col-start-3 xl:col-end-11 md:px-24 animate-fade-in'>
      {/* Header - Fixed at top */}
      <div className={`flex items-center gap-3 px-5 pb-4 pt-6 transition-all duration-200 ${
        showHeaderBorder ? 'border-b' : ''
      }`}>
        <Link to="/profile">
          <ArrowLeft className="h-6 w-6" />
        </Link>
        <h1 className="text-lg font-medium">Stats</h1>
      </div>

      {/* Stats Content - Scrollable container */}
      <div 
        ref={scrollContainerRef}
        className={`flex-1 overflow-y-auto pb-6 px-5 transition-all duration-200 ${
          showContentBottomBorder ? 'border-b' : ''
        }`}
      >
        <div className='flex flex-col gap-2'>
          {hasStats ? (
            <>
              <BasicStats reviewLogs={reviewLogs} />
              <Heatmap reviewLogs={reviewLogs} />
              <div className='flex sm:flex-row flex-col gap-2 w-full'>
                <RatingPieChart reviewLogs={reviewLogs} />
                <TimeOfDayChart reviewLogs={reviewLogs} />
              </div>
              <ReviewChart reviewLogs={reviewLogs} />
              <TimeBarChart reviewLogs={reviewLogs} />
            </>
          ) : (
            <EmptyStats />
          )}
        </div>
      </div>
    </div>
  );
}

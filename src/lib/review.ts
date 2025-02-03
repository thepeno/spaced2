import {
  RATING_NAME_TO_NUMBER,
  STATE_NAME_TO_NUMBER,
} from '@/lib/card-mapping';
import {
  OperationWithId,
  ReviewLogDeletedOperation,
  ReviewLogOperation,
} from '@/lib/sync/operation';
import { Card, fsrs, generatorParameters, Grade, ReviewLog } from 'ts-fsrs';

const params = generatorParameters({
  enable_fuzz: true,
  maximum_interval: 100,
});
const f = fsrs(params);

export function gradeCard(
  card: Card,
  grade: Grade,
  now = new Date()
): {
  nextCard: Card;
  //   reviewLog: NewReviewLog;
} {
  const recordLog = f.repeat(card, now, (recordLog) => {
    const recordLogItem = recordLog[grade];

    //TODO: add in the review logs
    // const reviewLog: NewReviewLog = {
    //   ...recordLogItem.log,
    //   id: crypto.randomUUID(),
    //   cardId: card.id,
    //   grade: grade,
    //   state: recordLogItem.log.state,
    // };

    const nextCard = {
      ...card,
      ...recordLogItem.card,
    };

    return {
      nextCard,
      //   reviewLog,
    };
  });

  return recordLog;
}

/**
 * Converts a review log operation to a review log.
 */
export function reviewLogOperationToReviewLog(
  operation: ReviewLogOperation
): ReviewLog {
  return {
    ...operation.payload,
    rating: RATING_NAME_TO_NUMBER[operation.payload.grade],
    state: STATE_NAME_TO_NUMBER[operation.payload.state],
  };
}

/**
 * Processes review log operations and returns a list of review logs.
 */
export function processReviewLogOperations(
  operations: OperationWithId[]
): ReviewLog[] {
  const reviewLogMap: Record<string, ReviewLog> = {};

  const reviewLogOperations = operations.filter(
    (op): op is ReviewLogOperation & { id: number } => op.type === 'reviewLog'
  );

  reviewLogOperations.forEach((op) => {
    reviewLogMap[op.id] = reviewLogOperationToReviewLog(op);
  });

  const reviewLogDeletedOperations = operations.filter(
    (op): op is ReviewLogDeletedOperation & { id: number } =>
      op.type === 'reviewLogDeleted'
  );
  const reviewLogsToDeleteSet = new Set<string>();
  reviewLogDeletedOperations.forEach((op) => {
    if (op.payload.deleted) {
      reviewLogsToDeleteSet.add(op.payload.reviewLogId);
    } else {
      reviewLogsToDeleteSet.delete(op.payload.reviewLogId);
    }
  });

  const reviewLogs = Object.entries(reviewLogMap)
    .filter(([id]) => !reviewLogsToDeleteSet.has(id))
    .map(([, log]) => log);

  return reviewLogs;
}

import { Card, fsrs, generatorParameters, Grade } from 'ts-fsrs';

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

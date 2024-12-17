import { Button } from '@/components/ui/button';
import { Grade, Rating } from 'ts-fsrs';

type GradeButtonsProps = {
  onGrade: (grade: Grade) => void;
};

export default function GradeButtons({ onGrade }: GradeButtonsProps) {
  return (
    <div className='grid grid-cols-2 gap-2 my-4'>
      <Button onClick={() => onGrade(Rating.Again)}>Again</Button>
      <Button onClick={() => onGrade(Rating.Hard)}>Hard</Button>
      <Button onClick={() => onGrade(Rating.Good)}>Good</Button>
      <Button onClick={() => onGrade(Rating.Easy)}>Easy</Button>
    </div>
  );
}

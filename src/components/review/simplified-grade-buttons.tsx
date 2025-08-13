import { Button } from '@/components/ui/button';
import { Check, X } from 'phosphor-react';
import { Rating } from 'ts-fsrs';

type Grade = Rating.Again | Rating.Hard | Rating.Good | Rating.Easy;

interface SimplifiedGradeButtonsProps {
  onGrade: (grade: Grade) => void;
  visible: boolean;
}

export default function SimplifiedGradeButtons({
  onGrade,
  visible,
}: SimplifiedGradeButtonsProps) {
  if (!visible) {
    return null;
  }

  return (
    <div className="flex gap-2 w-full mx-auto">
      <Button
        variant="outline"
        className="flex-1 h-12 shadow-none rounded-[12px]"
        onClick={() => onGrade(Rating.Again)}
      >
        <X className="h-5 w-5 text-red-500" />
      </Button>
      <Button
        variant="outline"
        className="flex-1 h-12 shadow-none rounded-[12px]"
        onClick={() => onGrade(Rating.Good)}
      >
        <Check className="h-5 w-5 text-green-500" />
      </Button>
    </div>
  );
}
import VibrationPattern from '@/lib/vibrate';
import { Check, X } from 'phosphor-react';
import { Grade, Rating } from 'ts-fsrs';

type MobileGradeButtonsProps = {
  onGrade: (grade: Grade) => void;
};

export default function MobileGradeButtons({
  onGrade,
}: MobileGradeButtonsProps) {
  return (
    <div className='w-full flex justify-center items-stretch gap-1 bg-muted-foreground/10 backdrop-blur-lg rounded-b-2xl p-2'>
      <div
        className='bg-muted  rounded-bl-xl h-28 w-16 flex items-center justify-center active:scale-95 transition-all duration-100'
        onClick={() => {
          navigator?.vibrate?.(VibrationPattern.successConfirm);
          onGrade(Rating.Hard);
        }}
      >
        <X className='size-6 text-primary' />
      </div>

      <div className='flex flex-col gap-0.5 justify-end flex-1 h-28 bg-transparent'>
        <button
          className='bg-muted text-muted-foreground/30 uppercase text-sm font-bold tracking-widest py-2 flex-1 active:scale-95 transition-all duration-100'
          onClick={async () => {
            navigator?.vibrate?.(VibrationPattern.errorAlert);
            onGrade(Rating.Again);
          }}
        >
          Again
        </button>
        <button
          className='bg-muted text-primary text-center w-full rounded-none h-18 tracking-widest font-bold uppercase text-xl active:scale-95 transition-all duration-100'
          onClick={() => {
            navigator?.vibrate?.(VibrationPattern.successConfirm);
            onGrade(Rating.Good);
          }}
        >
          Good
        </button>
      </div>

      <div
        className='bg-muted rounded-br-xl h-28 w-16 flex items-center justify-center active:scale-95 transition-all duration-100'
        onClick={() => {
          navigator?.vibrate?.(VibrationPattern.successConfirm);
          onGrade(Rating.Easy);
        }}
      >
        <Check className='size-6 text-primary' />
      </div>
    </div>
  );
}

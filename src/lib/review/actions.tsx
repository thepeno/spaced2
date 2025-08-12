import { CardContentFormValues } from '@/lib/form-schema';
import {
  updateBookmarkedClientSide,
  updateCardContentOperation,
  updateDeletedClientSide,
  updateSuspendedClientSide,
} from '@/lib/sync/operation';
import { CardWithMetadata } from '@/lib/types';
import { MAX_DATE } from '@/lib/utils';
import VibrationPattern from '@/lib/vibrate';
import { BookmarkSimple, CaretDoubleRight, EyeSlash, Trash } from 'phosphor-react';
import { toast } from 'sonner';

export async function handleCardDelete(reviewCard?: CardWithMetadata) {
  if (!reviewCard) return;
  await updateDeletedClientSide(reviewCard.id, true);
  toast('Card deleted', {
    icon: <Trash className='size-4' />,
  });
}

export async function handleCardSuspend(reviewCard?: CardWithMetadata) {
  if (!reviewCard) return;
  const tenMinutesFromNow = new Date(Date.now() + 10 * 60 * 1000);
  await updateSuspendedClientSide(reviewCard.id, tenMinutesFromNow);
  navigator?.vibrate(VibrationPattern.buttonTap);
  toast('Skipped for 10 minutes', {
    icon: <CaretDoubleRight className='size-4' />,
  });
}

export async function handleCardBury(reviewCard?: CardWithMetadata) {
  if (!reviewCard) return;
  await updateSuspendedClientSide(reviewCard.id, MAX_DATE);
  navigator?.vibrate(VibrationPattern.buttonTap);
  toast("You won't see this card again", {
    icon: <EyeSlash className='size-4' />,
  });
}

export async function handleCardSave(
  bookmarked: boolean,
  reviewCard?: CardWithMetadata
) {
  if (!reviewCard) return;
  await updateBookmarkedClientSide(reviewCard.id, bookmarked);
  if (bookmarked) {
    navigator?.vibrate(VibrationPattern.successConfirm);
    toast('Saved', {
      icon: (
        <BookmarkSimple className='size-4 text-primary' weight='fill' />
      ),
    });
  } else {
    toast('Removed from saved');
  }
}

export async function handleCardEdit(
  values: CardContentFormValues,
  reviewCard?: CardWithMetadata
) {
  if (!reviewCard) return;
  const hasChanged =
    reviewCard.front !== values.front || reviewCard.back !== values.back;

  if (hasChanged) {
    await updateCardContentOperation(reviewCard.id, values.front, values.back);
  }
}

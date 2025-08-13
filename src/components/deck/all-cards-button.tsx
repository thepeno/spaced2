import { Button } from '@/components/ui/button';
import { Stack } from 'phosphor-react';
import { Link } from 'react-router';

export default function AllCardsButton() {
  return (
    <Link to="/decks/_all" className="w-full">
      <Button variant="outline" className="w-full h-12 flex items-center justify-center gap-2 shadow-none rounded-[12px]">
        <Stack className="h-5 w-5 text-primary" />
        <span>All cards</span>
      </Button>
    </Link>
  );
}
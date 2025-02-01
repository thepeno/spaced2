import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Search } from 'lucide-react';

type SearchBarProps = {
  search: string;
  setSearch: (search: string) => void;
  placeholder?: string;
};

export default function SearchBar({
  search,
  setSearch,
  placeholder = 'Search...',
}: SearchBarProps) {
  return (
    <div className='relative w-full max-w-sm col-span-12 mb-6 sm:mb-8 mx-auto'>
      <Button
        variant='ghost'
        size='icon'
        className='absolute left-1 top-1/2 -translate-y-1/2 h-8 w-8 hover:bg-transparent'
      >
        <Search className='h-4 w-4' />
      </Button>
      <Input
        className='pl-12 h-12'
        type='text'
        placeholder={placeholder}
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      />
    </div>
  );
}

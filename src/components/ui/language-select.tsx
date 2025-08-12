import * as React from 'react';
import { Check, CaretDown } from 'phosphor-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useMediaQuery } from '@uidotdev/usehooks';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

export const SUPPORTED_LANGUAGES = [
  { value: 'af', label: 'Afrikaans' },
  { value: 'ar', label: 'Arabic' },
  { value: 'bg', label: 'Bulgarian' },
  { value: 'bn', label: 'Bengali' },
  { value: 'ca', label: 'Catalan' },
  { value: 'cs', label: 'Czech' },
  { value: 'da', label: 'Danish' },
  { value: 'de', label: 'German' },
  { value: 'el', label: 'Greek' },
  { value: 'en', label: 'English' },
  { value: 'es', label: 'Spanish' },
  { value: 'et', label: 'Estonian' },
  { value: 'fa', label: 'Persian' },
  { value: 'fi', label: 'Finnish' },
  { value: 'fr', label: 'French' },
  { value: 'he', label: 'Hebrew' },
  { value: 'hi', label: 'Hindi' },
  { value: 'hr', label: 'Croatian' },
  { value: 'hu', label: 'Hungarian' },
  { value: 'id', label: 'Indonesian' },
  { value: 'is', label: 'Icelandic' },
  { value: 'it', label: 'Italian' },
  { value: 'ja', label: 'Japanese' },
  { value: 'ko', label: 'Korean' },
  { value: 'lt', label: 'Lithuanian' },
  { value: 'lv', label: 'Latvian' },
  { value: 'ms', label: 'Malay' },
  { value: 'nl', label: 'Dutch' },
  { value: 'no', label: 'Norwegian' },
  { value: 'pl', label: 'Polish' },
  { value: 'pt', label: 'Portuguese' },
  { value: 'pt-br', label: 'Portuguese (Brazilian)' },
  { value: 'ro', label: 'Romanian' },
  { value: 'ru', label: 'Russian' },
  { value: 'sk', label: 'Slovak' },
  { value: 'sl', label: 'Slovenian' },
  { value: 'sv', label: 'Swedish' },
  { value: 'th', label: 'Thai' },
  { value: 'tr', label: 'Turkish' },
  { value: 'uk', label: 'Ukrainian' },
  { value: 'ur', label: 'Urdu' },
  { value: 'vi', label: 'Vietnamese' },
  { value: 'zh', label: 'Chinese' },
] as const;

interface LanguageSelectProps {
  value?: string;
  onValueChange: (value: string) => void;
  placeholder?: string;
  className?: string;
  disabled?: boolean;
}

export function LanguageSelect({
  value,
  onValueChange,
  placeholder = 'Select language...',
  className,
  disabled = false,
}: LanguageSelectProps) {
  const [open, setOpen] = React.useState(false);
  const [search, setSearch] = React.useState('');
  const dropdownRef = React.useRef<HTMLDivElement>(null);
  const buttonRef = React.useRef<HTMLButtonElement>(null);
  const isMobile = useMediaQuery('(max-width: 768px)');

  const selectedLanguage = SUPPORTED_LANGUAGES.find(
    (language) => language.value === value
  );

  const filteredLanguages = SUPPORTED_LANGUAGES.filter((language) =>
    language.label.toLowerCase().includes(search.toLowerCase())
  );

  // Close dropdown when clicking outside
  React.useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node) &&
        buttonRef.current &&
        !buttonRef.current.contains(event.target as Node)
      ) {
        setOpen(false);
      }
    };

    if (open) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [open]);

  const handleSelect = (languageValue: string) => {
    console.log('Language selected:', languageValue);
    const newValue = languageValue === value ? '' : languageValue;
    onValueChange(newValue);
    setOpen(false);
    setSearch('');
  };

  const handleToggle = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setOpen(!open);
  };

  const renderOptions = () => (
    <>
      <div className="p-4 border-b">
        <Input
          placeholder="Search languages..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="text-sm"
          autoFocus={!isMobile}
        />
      </div>
      <div className={cn("overflow-y-auto", isMobile ? "max-h-[60vh]" : "max-h-60")}>
        {filteredLanguages.length === 0 ? (
          <div className="p-4 text-sm text-muted-foreground text-center">
            No language found.
          </div>
        ) : (
          filteredLanguages.map((language) => (
            <div
              key={language.value}
              className="flex items-center px-4 py-3 text-sm cursor-pointer hover:bg-accent hover:text-accent-foreground"
              onClick={() => handleSelect(language.value)}
            >
              <Check
                className={cn(
                  'mr-3 h-4 w-4',
                  value === language.value ? 'opacity-100' : 'opacity-0'
                )}
              />
              {language.label}
            </div>
          ))
        )}
      </div>
    </>
  );

  return (
    <>
      <div className="relative">
        <Button
          ref={buttonRef}
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className={cn('w-full justify-between', className)}
          disabled={disabled}
          type="button"
          onClick={handleToggle}
        >
          {selectedLanguage ? selectedLanguage.label : placeholder}
          <CaretDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>

        {/* Desktop Dropdown */}
        {open && !isMobile && (
          <div
            ref={dropdownRef}
            className="absolute z-50 w-full mt-1 bg-popover border rounded-md shadow-md"
          >
            {renderOptions()}
          </div>
        )}
      </div>

      {/* Mobile Modal */}
      {isMobile && (
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogContent className="fixed bottom-0 left-0 right-0 top-auto max-w-none w-full rounded-t-xl rounded-b-none border-0 p-0 m-0 translate-x-0 translate-y-0">
            <DialogHeader className="p-4 pb-0">
              <DialogTitle>Select a language</DialogTitle>
            </DialogHeader>
            {renderOptions()}
          </DialogContent>
        </Dialog>
      )}
    </>
  );
}
import { Button } from '@/components/ui/button';
import { Gear } from 'phosphor-react';
import { Link } from 'react-router';

export function SettingsLinkButton() {
  return (
    <Link to="/settings">
      <Button variant="outline" className="w-full justify-start shadow-none">
        <Gear className="mr-2 h-4 w-4" />
        Settings
      </Button>
    </Link>
  );
}
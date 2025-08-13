import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Card } from '@/components/ui/card';
import { ArrowLeft } from 'phosphor-react';
import { Link } from 'react-router';
import { useState, useEffect } from 'react';

export default function SettingsRoute() {
  const [alwaysShowSearch, setAlwaysShowSearch] = useState(() => {
    const saved = localStorage.getItem('settings-always-show-search');
    return saved === 'true';
  });

  useEffect(() => {
    localStorage.setItem('settings-always-show-search', alwaysShowSearch.toString());
    // Dispatch custom event for same-tab updates
    window.dispatchEvent(new Event('settings-updated'));
  }, [alwaysShowSearch]);

  return (
    <div className="flex flex-col h-full max-w-2xl mx-auto">
      {/* Header */}
      <div className="flex items-center gap-4 mb-6">
        <Link to="/profile">
          <ArrowLeft className="h-6 w-6" />
        </Link>
        <h1 className="text-2xl font-semibold">Settings</h1>
      </div>

      {/* Settings Cards */}
      <div className="space-y-4">
        {/* Search Settings */}
        <Card className="p-4 shadow-none">
          <h2 className="text-lg font-medium mb-4">Deck Search</h2>
          <div className="flex items-center justify-between">
            <Label htmlFor="always-show-search" className="flex flex-col gap-1">
              <span>Always show search</span>
              <span className="text-sm text-muted-foreground font-normal">
                Show search bar regardless of deck count
              </span>
            </Label>
            <Switch
              id="always-show-search"
              size="lg"
              checked={alwaysShowSearch}
              onCheckedChange={setAlwaysShowSearch}
            />
          </div>
        </Card>
      </div>
    </div>
  );
}
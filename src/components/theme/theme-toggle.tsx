import { useTheme } from '@/components/theme/theme-provider';
import { Card } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Monitor, Moon, Sun } from 'phosphor-react';

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();

  const getNextTheme = () => {
    if (theme === 'system') return 'dark';
    if (theme === 'dark') return 'light';
    return 'system';
  };

  const getCurrentThemeInfo = () => {
    switch (theme) {
      case 'system':
        return { icon: Monitor, label: 'System', description: 'Follow system preference' };
      case 'dark':
        return { icon: Moon, label: 'Dark', description: 'Dark theme' };
      default:
        return { icon: Sun, label: 'Light', description: 'Light theme' };
    }
  };

  const themeInfo = getCurrentThemeInfo();
  const IconComponent = themeInfo.icon;

  return (
    <Card className="p-4 shadow-none">
      <h2 className="text-lg font-medium mb-4">Theme</h2>
      <div className="flex items-center justify-between">
        <Label className="flex flex-col gap-1">
          <span>{themeInfo.label} theme</span>
          <span className="text-sm text-muted-foreground font-normal">
            {themeInfo.description}
          </span>
        </Label>
        <Button
          variant="outline"
          size="sm"
          onClick={() => setTheme(getNextTheme())}
          className="flex items-center gap-2"
        >
          <IconComponent className="h-4 w-4" />
          {themeInfo.label}
        </Button>
      </div>
    </Card>
  );
}

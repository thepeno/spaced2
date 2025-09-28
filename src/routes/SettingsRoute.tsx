import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Eye, EyeSlash } from 'phosphor-react';
import { Link } from 'react-router';
import { useState, useEffect, useRef } from 'react';
import { ThemeToggle } from '@/components/theme/theme-toggle';
import { ttsManager, TTSProvider } from '@/lib/tts/tts-manager';
import { toast } from 'sonner';

export default function SettingsRoute() {
  const [alwaysShowSearch, setAlwaysShowSearch] = useState(() => {
    const saved = localStorage.getItem('settings-always-show-search');
    return saved === 'true';
  });

  const [openaiApiKey, setOpenaiApiKey] = useState(() => {
    return localStorage.getItem('openai-api-key') || '';
  });

  const [googleApiKey, setGoogleApiKey] = useState(() => {
    return localStorage.getItem('google-tts-api-key') || '';
  });

  const [ttsProvider, setTtsProvider] = useState<TTSProvider>(() => {
    return (localStorage.getItem('tts-provider') as TTSProvider) || 'openai';
  });

  const [showOpenaiKey, setShowOpenaiKey] = useState(false);
  const [showGoogleKey, setShowGoogleKey] = useState(false);
  const [isTestingTTS, setIsTestingTTS] = useState(false);
  const [cacheSize, setCacheSize] = useState<number>(0);
  const [isClearingCache, setIsClearingCache] = useState(false);
  const [showHeaderBorder, setShowHeaderBorder] = useState(false);
  const [showContentBottomBorder, setShowContentBottomBorder] = useState(true);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  const [ttsAutoPlay, setTtsAutoPlay] = useState(() => {
    const saved = localStorage.getItem('tts-auto-play');
    return saved === null ? true : saved === 'true'; // Default to true
  });

  const [ttsClickToPlay, setTtsClickToPlay] = useState(() => {
    const saved = localStorage.getItem('tts-click-to-play');
    return saved === 'true';
  });

  const [createBidirectionalCards, setCreateBidirectionalCards] = useState(() => {
    const saved = localStorage.getItem('create-bidirectional-cards');
    return saved === null ? true : saved === 'true'; // Default to true
  });

  useEffect(() => {
    localStorage.setItem('settings-always-show-search', alwaysShowSearch.toString());
    // Dispatch custom event for same-tab updates
    window.dispatchEvent(new Event('settings-updated'));
  }, [alwaysShowSearch]);

  // Load cache size on component mount
  useEffect(() => {
    const loadCacheSize = async () => {
      const size = await ttsManager.getTotalCacheSize();
      setCacheSize(size);
    };
    loadCacheSize();
  }, []);

  // Handle scroll events for border visibility
  useEffect(() => {
    const scrollContainer = scrollContainerRef.current;
    if (!scrollContainer) return;

    const handleScroll = () => {
      const { scrollTop, scrollHeight, clientHeight } = scrollContainer;
      
      // Show header border when scrolled down
      setShowHeaderBorder(scrollTop > 0);
      
      // Hide bottom border when at the bottom
      const isAtBottom = scrollTop + clientHeight >= scrollHeight - 1;
      setShowContentBottomBorder(!isAtBottom);
    };

    scrollContainer.addEventListener('scroll', handleScroll);
    // Initial check
    handleScroll();

    return () => scrollContainer.removeEventListener('scroll', handleScroll);
  }, []);

  // Save TTS settings
  useEffect(() => {
    localStorage.setItem('tts-auto-play', ttsAutoPlay.toString());
    window.dispatchEvent(new Event('tts-settings-updated'));
  }, [ttsAutoPlay]);

  useEffect(() => {
    localStorage.setItem('tts-click-to-play', ttsClickToPlay.toString());
    window.dispatchEvent(new Event('tts-settings-updated'));
  }, [ttsClickToPlay]);

  useEffect(() => {
    localStorage.setItem('create-bidirectional-cards', createBidirectionalCards.toString());
    window.dispatchEvent(new Event('card-settings-updated'));
  }, [createBidirectionalCards]);

  const handleSaveOpenaiKey = () => {
    ttsManager.setOpenAIApiKey(openaiApiKey);
    toast.success('OpenAI API key saved');
  };

  const handleSaveGoogleKey = () => {
    ttsManager.setGoogleApiKey(googleApiKey);
    toast.success('Google API key saved');
  };

  const handleProviderChange = (provider: TTSProvider) => {
    setTtsProvider(provider);
    ttsManager.setProvider(provider);
    toast.success(`TTS provider changed to ${provider}`);
  };

  const handleTestTTS = async () => {
    const currentProvider = ttsManager.getProvider();

    // Check if current provider has API key (except browser)
    if (currentProvider === 'openai' && !ttsManager.hasOpenAIApiKey()) {
      toast.error('Please enter OpenAI API key first');
      return;
    }

    if (currentProvider === 'google' && !ttsManager.hasGoogleApiKey()) {
      toast.error('Please enter Google API key first');
      return;
    }

    setIsTestingTTS(true);
    try {
      await ttsManager.speak('Hello, this is a test of the text to speech system.', 'English');
      toast.success(`${currentProvider} TTS test successful!`);
    } catch (error) {
      toast.error(`${currentProvider} TTS test failed. Please check your settings.`);
      console.error('TTS test error:', error);
    } finally {
      setIsTestingTTS(false);
    }
  };

  const formatCacheSize = (bytes: number): string => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  };

  const handleClearCache = async () => {
    setIsClearingCache(true);
    try {
      await ttsManager.clearAllCaches();
      setCacheSize(0);
      toast.success('TTS cache cleared successfully');
    } catch (error) {
      console.error('Failed to clear cache:', error);
      toast.error('Failed to clear cache');
    } finally {
      setIsClearingCache(false);
    }
  };

  return (
    <div className="flex flex-col h-full grow max-w-2xl mx-auto">
      {/* Header - Fixed at top */}
      <div className={`flex items-center gap-3 px-5 pb-4 pt-6 transition-all duration-200 ${
        showHeaderBorder ? 'border-b' : ''
      }`}>
        <Link to="/profile">
          <ArrowLeft className="h-6 w-6" />
        </Link>
        <h1 className="text-lg font-medium">Settings</h1>
      </div>

      {/* Settings Cards - Scrollable container */}
      <div 
        ref={scrollContainerRef}
        className={`flex-1 overflow-y-auto pb-3 px-5 pt-2 transition-all duration-200 ${
          showContentBottomBorder ? 'border-b' : ''
        }`}
      >
        <div className="space-y-4">
          {/* General Settings */}
          <Card className="p-4 shadow-none">
            <h2 className="text-lg font-medium mb-4">General</h2>

            {/* Search Setting */}
            <div className="flex items-center justify-between mb-4">
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

            {/* Bidirectional Cards Setting */}
            <div className="flex items-center justify-between">
              <Label htmlFor="create-bidirectional-cards" className="flex flex-col gap-1">
                <span>Create bidirectional cards</span>
                <span className="text-sm text-muted-foreground font-normal">
                  Automatically create reverse cards (native → target) when adding new flashcards
                </span>
              </Label>
              <Switch
                id="create-bidirectional-cards"
                size="lg"
                checked={createBidirectionalCards}
                onCheckedChange={setCreateBidirectionalCards}
              />
            </div>
          </Card>

          {/* TTS Settings */}
          <Card className="p-4 shadow-none">
            <h2 className="text-lg font-medium mb-4">Text-to-Speech</h2>
            <div className="space-y-6">
              {/* Provider Selection */}
              <div className="space-y-2">
                <Label className="flex flex-col gap-1">
                  <span>TTS Provider</span>
                  <span className="text-sm text-muted-foreground font-normal">
                    Choose your preferred text-to-speech service
                  </span>
                </Label>
                <div className="grid gap-2">
                  {ttsManager.getAvailableProviders().map((provider) => (
                    <div
                      key={provider.value}
                      className={`p-3 border rounded-lg cursor-pointer transition-colors ${ttsProvider === provider.value
                        ? 'border-primary bg-primary/5'
                        : 'border-border hover:border-primary/50'
                        }`}
                      onClick={() => handleProviderChange(provider.value)}
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-medium">{provider.label}</span>
                            {provider.hasApiKey && provider.value !== 'browser' && (
                              <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded">
                                Configured
                              </span>
                            )}
                          </div>
                          <p className="text-sm text-muted-foreground">{provider.description}</p>
                        </div>
                        <div className={`w-4 h-4 rounded-full border-2 ${ttsProvider === provider.value
                          ? 'border-primary bg-primary'
                          : 'border-border'
                          }`} />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* TTS Behavior Settings */}
              <div className="space-y-4 pt-4 border-t">
                <div>
                  <h3 className="font-medium text-sm mb-3">Playback Behavior</h3>

                  {/* Auto-play setting */}
                  <div className="flex items-center justify-between mb-4">
                    <Label htmlFor="tts-auto-play" className="flex flex-col gap-1">
                      <span>Auto-play audio on reveal</span>
                      <span className="text-sm text-muted-foreground font-normal">
                        Automatically play target language audio when card is revealed
                      </span>
                    </Label>
                    <Switch
                      id="tts-auto-play"
                      size="lg"
                      checked={ttsAutoPlay}
                      onCheckedChange={setTtsAutoPlay}
                    />
                  </div>

                  {/* Click-to-play setting */}
                  <div className="flex items-center justify-between">
                    <Label htmlFor="tts-click-to-play" className="flex flex-col gap-1">
                      <span>Click text to play audio</span>
                      <span className="text-sm text-muted-foreground font-normal">
                        Hide play buttons and play audio by clicking on text instead
                      </span>
                    </Label>
                    <Switch
                      id="tts-click-to-play"
                      size="lg"
                      checked={ttsClickToPlay}
                      onCheckedChange={setTtsClickToPlay}
                    />
                  </div>
                </div>
              </div>

              {/* OpenAI API Key */}
              <div className="space-y-2">
                <Label htmlFor="openai-key" className="flex flex-col gap-1">
                  <span>OpenAI API Key</span>
                  <span className="text-sm text-muted-foreground font-normal">
                    Required for OpenAI TTS (high-quality voices)
                  </span>
                </Label>
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <Input
                      id="openai-key"
                      type={showOpenaiKey ? "text" : "password"}
                      value={openaiApiKey}
                      onChange={(e) => setOpenaiApiKey(e.target.value)}
                      placeholder="sk-..."
                      className="pr-10"
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="absolute right-0 top-0 h-full px-3"
                      onClick={() => setShowOpenaiKey(!showOpenaiKey)}
                    >
                      {showOpenaiKey ? (
                        <EyeSlash className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                  <Button
                    onClick={handleSaveOpenaiKey}
                    disabled={!openaiApiKey}
                  >
                    Save
                  </Button>
                </div>
                <p className="text-xs text-muted-foreground">
                  Get your API key from{' '}
                  <a
                    href="https://platform.openai.com/api-keys"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-primary hover:underline"
                  >
                    OpenAI Platform
                  </a>
                </p>
              </div>

              {/* Google Cloud API Key */}
              <div className="space-y-2">
                <Label htmlFor="google-key" className="flex flex-col gap-1">
                  <span>Google Cloud API Key</span>
                  <span className="text-sm text-muted-foreground font-normal">
                    Required for Google Cloud TTS (excellent language support)
                  </span>
                </Label>
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <Input
                      id="google-key"
                      type={showGoogleKey ? "text" : "password"}
                      value={googleApiKey}
                      onChange={(e) => setGoogleApiKey(e.target.value)}
                      placeholder="AIza..."
                      className="pr-10"
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="absolute right-0 top-0 h-full px-3"
                      onClick={() => setShowGoogleKey(!showGoogleKey)}
                    >
                      {showGoogleKey ? (
                        <EyeSlash className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                  <Button
                    onClick={handleSaveGoogleKey}
                    disabled={!googleApiKey}
                  >
                    Save
                  </Button>
                </div>
                <p className="text-xs text-muted-foreground">
                  Get your API key from{' '}
                  <a
                    href="https://console.cloud.google.com/apis/credentials"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-primary hover:underline"
                  >
                    Google Cloud Console
                  </a>
                </p>
              </div>

              {/* Test Button */}
              <div className="pt-2">
                <Button
                  variant="outline"
                  onClick={handleTestTTS}
                  disabled={isTestingTTS}
                  className="w-full"
                >
                  {isTestingTTS ? 'Testing...' : `Test ${ttsProvider} TTS`}
                </Button>
              </div>

              {/* Cache Management */}
              <div className="pt-4 border-t">
                <div className="space-y-3">
                  <div>
                    <h3 className="font-medium text-sm">Cache Management</h3>
                    <p className="text-xs text-muted-foreground">
                      Audio files are cached locally to improve performance and reduce API costs
                    </p>
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-sm font-medium">Storage used:</span>
                      <span className="text-sm text-muted-foreground ml-2">
                        {formatCacheSize(cacheSize)}
                      </span>
                    </div>

                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleClearCache}
                      disabled={isClearingCache || cacheSize === 0}
                    >
                      {isClearingCache ? 'Clearing...' : 'Clear Cache'}
                    </Button>
                  </div>

                  {cacheSize > 10 * 1024 * 1024 && ( // Show warning if > 10MB
                    <div className="text-xs text-amber-600 bg-amber-50 p-2 rounded">
                      ⚠️ Cache size is large. Consider clearing to free up storage space.
                    </div>
                  )}
                </div>
              </div>
            </div>
          </Card>

          <ThemeToggle />
        </div>
      </div>
    </div>
  );
}

// src/components/photo-poet-app.tsx
"use client";

import { useState, useRef, useEffect, useCallback } from 'react';
import Image from 'next/image';
import { useTheme } from 'next-themes';
import { 
  Upload, Share2, Settings2, RefreshCw, Loader2, Feather, 
  Image as ImageIcon, FileText, Sun, Moon, Download, LinkIcon, Twitter, Facebook, Linkedin, Copy
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { PhotoPoetLogo } from '@/components/icons/photo-poet-logo';
import { handleGeneratePoem, handleRegeneratePoemWithLength, handleRegeneratePoemWithTone } from '@/lib/actions';
import { Skeleton } from '@/components/ui/skeleton';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';

type PoemLength = 'short' | 'medium' | 'long';

export default function PhotoPoetApp() {
  const [imageDataUrl, setImageDataUrl] = useState<string | null>(null);
  const [poem, setPoem] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [customTone, setCustomTone] = useState('');
  const [customLength, setCustomLength] = useState<PoemLength>('medium');
  const [displayPoem, setDisplayPoem] = useState<string | null>(null);
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  useEffect(() => {
    if (poem) {
      setDisplayPoem(null); 
      const timer = setTimeout(() => setDisplayPoem(poem), 50); 
      return () => clearTimeout(timer);
    }
  }, [poem]);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) { 
        toast({ title: 'File too large', description: 'Please upload an image smaller than 5MB.', variant: 'destructive' });
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setImageDataUrl(reader.result as string);
        setPoem(null);
        setDisplayPoem(null);
        // Reset tone and length for new image if desired, or keep previous settings
        // setCustomTone(''); 
        // setCustomLength('medium');
        toast({ title: 'Image Loaded', description: 'Ready to generate your poem.', variant: 'default', className: 'bg-primary text-primary-foreground' });
      };
      reader.readAsDataURL(file);
    }
  };

  const triggerFileUpload = () => {
    fileInputRef.current?.click();
  };

  const generatePoem = async () => {
    if (!imageDataUrl) {
      toast({ title: 'No Photo', description: 'Please upload a photo first.', variant: 'destructive' });
      return;
    }
    setIsLoading(true);
    setPoem(null); 
    setDisplayPoem(null);

    const stylePreferences = `Tone: ${customTone || 'eloquent'}. Length: ${customLength || 'medium'}.`;
    const result = await handleGeneratePoem(imageDataUrl, stylePreferences);
    
    setIsLoading(false);
    if (result.success && result.poem) {
      setPoem(result.poem);
      toast({ title: 'Poem Generated!', description: 'Your poetic masterpiece awaits.', className: 'bg-accent text-accent-foreground' });
    } else {
      toast({ title: 'Generation Error', description: result.error || 'Failed to generate poem. Please try again.', variant: 'destructive' });
    }
  };

  const regenerateWithLength = async () => {
    if (!imageDataUrl || !poem) return;
    setIsLoading(true);
    setDisplayPoem(null);
    const result = await handleRegeneratePoemWithLength(imageDataUrl, customLength);
    setIsLoading(false);
    if (result.success && result.poem) {
      setPoem(result.poem);
      toast({ title: 'Poem Reshaped!', description: `Length preference '${customLength}' applied.` });
    } else {
      toast({ title: 'Regeneration Error', description: result.error || 'Failed to regenerate poem.', variant: 'destructive' });
    }
  };

  const regenerateWithTone = async () => {
    if (!imageDataUrl || !poem || !customTone) {
      toast({ title: 'Missing Tone', description: 'Please enter a tone preference to refine your poem.', variant: 'default' });
      return;
    }
    setIsLoading(true);
    setDisplayPoem(null);
    const result = await handleRegeneratePoemWithTone(imageDataUrl, customTone);
    setIsLoading(false);
    if (result.success && result.poem) {
      setPoem(result.poem);
      toast({ title: 'Poem Reimagined!', description: `Tone preference '${customTone}' applied.` });
    } else {
      toast({ title: 'Regeneration Error', description: result.error || 'Failed to regenerate poem.', variant: 'destructive' });
    }
  };

  const handleDownloadPoem = () => {
    if (!poem) {
      toast({ title: 'Nothing to Download', description: 'Generate a poem first.', variant: 'destructive' });
      return;
    }
    const blob = new Blob([poem], { type: 'text/plain;charset=utf-8' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = 'PhotoPoem.txt';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(link.href);
    toast({ title: 'Poem Downloaded!', description: 'Saved as PhotoPoem.txt.' });
  };

  const handleCopyPoem = () => {
    if (!poem) {
      toast({ title: 'Nothing to Copy', description: 'Generate a poem first.', variant: 'destructive' });
      return;
    }
    navigator.clipboard.writeText(poem);
    toast({ title: 'Poem Copied!', description: 'Your verse is ready to paste.' });
  };
  
  const handleShare = async () => {
    if (!poem || !imageDataUrl) {
      toast({ title: 'Nothing to Share', description: 'Generate a poem first to share your creation.', variant: 'destructive' });
      return;
    }
    const title = 'My PhotoPoem Creation';
    const text = `Check out this poem I generated with PhotoPoet for my image:\n\n${poem}\n\n#PhotoPoet #AIpoetry`;
    const url = window.location.href; 

    if (navigator.share) {
      try {
        await navigator.share({ title, text, url });
        toast({ title: 'Shared Successfully!', description: 'Your poem has been shared.' });
      } catch (error) {
        if ((error as Error).name !== 'AbortError') {
          showManualShareOptions(title, text, url);
        }
      }
    } else {
      showManualShareOptions(title, text, url);
    }
  };

  const showManualShareOptions = (title: string, text: string, url: string) => {
    navigator.clipboard.writeText(text + "\n" + url);
    toast({ title: 'Copied to Clipboard!', description: 'Poem and link copied. Use the share links or paste anywhere.' });
  };

  const PoemDisplay = useCallback(() => {
    if (isLoading && !displayPoem) {
      const loadingMessages = ["Brewing your ballad...", "Composing your couplets...", "Polishing your prose...", "Weaving words of wonder..."];
      const randomMessage = loadingMessages[Math.floor(Math.random() * loadingMessages.length)];
      return (
        <div className="p-4 text-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary mx-auto mb-3" />
          <p className="text-muted-foreground italic mb-4">{randomMessage}</p>
          <div className="space-y-3">
            <Skeleton className="h-5 w-11/12 rounded-md bg-muted/50 mx-auto" />
            <Skeleton className="h-5 w-5/6 rounded-md bg-muted/50 mx-auto" />
            <Skeleton className="h-5 w-full rounded-md bg-muted/50 mx-auto" />
            <Skeleton className="h-5 w-4/6 rounded-md bg-muted/50 mx-auto" />
          </div>
        </div>
      );
    }
    if (displayPoem) {
      return (
        <pre className="poem-text-display animate-fadeIn">
          {displayPoem}
        </pre>
      );
    }
    if (imageDataUrl && !poem && !isLoading) {
       return <p className="text-muted-foreground italic text-center py-10 px-4">Your image is set! Adjust preferences below, then hit 'Generate Poem' to start the magic.</p>;
    }
    return (
      <div className="text-center py-10 px-4 flex flex-col items-center justify-center h-full">
        <Feather size={48} className="mb-4 text-primary opacity-70" />
        <p className="text-lg text-muted-foreground font-medium">Welcome to PhotoPoet</p>
        <p className="text-sm text-muted-foreground/80 mt-1">Upload a photo and let us weave words into your visuals.</p>
      </div>
    );
  }, [isLoading, displayPoem, poem, imageDataUrl]);


  if (!mounted) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
      </div>
    );
  }

  const shareUrl = encodeURIComponent(window.location.href);
  const shareText = encodeURIComponent(poem || "Check out PhotoPoet!");
  const shareTitle = encodeURIComponent("A Poem from PhotoPoet");

  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground selection:bg-primary selection:text-primary-foreground">
      <header className="sticky top-0 z-50 w-full border-b border-border/60 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80 shadow-sm">
        <div className="container mx-auto flex justify-between items-center p-3 h-20">
          <div className="flex items-center gap-3">
            <PhotoPoetLogo className="h-12 w-auto" />
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
              aria-label="Toggle theme"
              className="text-foreground/70 hover:text-foreground hover:bg-accent/20"
            >
              {theme === 'dark' ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
            </Button>
          </div>
        </div>
      </header>

      <main className="flex-grow container mx-auto p-4 md:p-6 lg:p-8 animate-slideUp">
        <div className="grid md:grid-cols-2 gap-6 lg:gap-8">
          
          <Card className="shadow-lg card-hover-elevate bg-card/90 border-border/50">
            <CardHeader className="pb-3">
              <CardTitle className="font-mono text-xl lg:text-2xl flex items-center gap-2.5 text-primary">
                <ImageIcon className="h-6 w-6 lg:h-7 lg:w-7" /> Your Visual Muse
              </CardTitle>
              <CardDescription className="text-muted-foreground/90">Upload an image to inspire a unique poem.</CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col items-center space-y-5">
              <div className="w-full aspect-[16/10] max-w-2xl bg-muted/40 rounded-lg overflow-hidden flex items-center justify-center border-2 border-dashed border-border/50 hover:border-primary/80 transition-colors duration-300 shadow-inner">
                {imageDataUrl ? (
                  <Image
                    src={imageDataUrl}
                    alt="Uploaded inspiration"
                    width={600}
                    height={400}
                    className="object-contain w-full h-full animate-fadeIn"
                    data-ai-hint="user uploaded image"
                  />
                ) : (
                  <div className="flex flex-col items-center justify-center text-muted-foreground/80 p-6 text-center">
                    <ImageIcon size={56} className="mb-3 opacity-60" />
                    <p className="font-medium">Your image will appear here.</p>
                    <p className="text-xs mt-1">Click the button below to select a photo.</p>
                  </div>
                )}
              </div>
              <Input
                type="file"
                accept="image/png, image/jpeg, image/webp, image/gif"
                onChange={handleFileChange}
                ref={fileInputRef}
                className="hidden"
                aria-label="Photo upload input"
              />
              <Button 
                onClick={triggerFileUpload} 
                className="w-full max-w-xs text-base py-5 group hover:shadow-primary/40 hover:shadow-lg" 
                variant="default"
                aria-label={imageDataUrl ? 'Change uploaded photo' : 'Upload a photo'}
              >
                <Upload className="mr-2 h-5 w-5 group-hover:animate-bounce" /> {imageDataUrl ? 'Change Photo' : 'Select Photo'}
              </Button>
            </CardContent>
          </Card>

          <Card className="shadow-lg flex flex-col bg-card/90 border-border/50 card-hover-elevate">
            <CardHeader className="pb-3">
              <CardTitle className="font-mono text-xl lg:text-2xl flex items-center gap-2.5 text-accent">
                <FileText className="h-6 w-6 lg:h-7 lg:w-7" /> Poetic Echoes
              </CardTitle>
              <CardDescription className="text-muted-foreground/90">AI-crafted verse inspired by your image.</CardDescription>
            </CardHeader>
            <CardContent className="flex-grow space-y-5 flex flex-col justify-between">
              <div className="poem-text-display min-h-[200px] flex flex-col justify-center"> {/* Ensure min-height for placeholder */}
                <PoemDisplay />
              </div>
              
              {imageDataUrl && (
                <div className="space-y-4 p-4 border border-border/40 rounded-lg bg-muted/30 shadow-sm">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-lg font-semibold text-primary flex items-center gap-2">
                      <Settings2 className="h-5 w-5" /> {poem ? "Refine Your Verse" : "Set Preferences"}
                    </h3>
                  </div>
                  
                  <div className="grid sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="poemLength" className="text-sm font-medium text-foreground/90">Poem Length</Label>
                      <Select value={customLength} onValueChange={(value: PoemLength) => setCustomLength(value)}>
                        <SelectTrigger id="poemLength" className="bg-background hover:border-primary/60 focus:ring-primary/50">
                          <SelectValue placeholder="Select length" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="short">Short &amp; Sweet</SelectItem>
                          <SelectItem value="medium">Medium Verse</SelectItem>
                          <SelectItem value="long">Epic Tale</SelectItem>
                        </SelectContent>
                      </Select>
                      {poem && (
                         <Button onClick={regenerateWithLength} disabled={isLoading} variant="outline" className="w-full mt-1.5 group hover:border-primary hover:text-primary">
                          {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <RefreshCw className="mr-2 h-4 w-4 group-hover:rotate-180 transition-transform duration-300" />}
                          Apply Length
                        </Button>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="poemTone" className="text-sm font-medium text-foreground/90">Poem Tone</Label>
                      <Input
                        id="poemTone"
                        type="text"
                        value={customTone}
                        onChange={(e) => setCustomTone(e.target.value)}
                        placeholder="e.g., joyful, reflective"
                        className="bg-background hover:border-primary/60 focus:ring-primary/50"
                      />
                       {poem && (
                          <Button onClick={regenerateWithTone} disabled={isLoading || !customTone} variant="outline" className="w-full mt-1.5 group hover:border-primary hover:text-primary">
                            {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <RefreshCw className="mr-2 h-4 w-4 group-hover:rotate-180 transition-transform duration-300" />}
                            Apply Tone
                          </Button>
                       )}
                    </div>
                  </div>
                </div>
              )}

              {imageDataUrl && !poem && (
                <Button 
                  onClick={generatePoem} 
                  disabled={isLoading} 
                  className="w-full text-base py-5 group hover:shadow-accent/40 hover:shadow-lg"
                  variant="secondary"
                  aria-label="Generate poem from uploaded image"
                >
                  {isLoading ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : <Feather className="mr-2 h-5 w-5 group-hover:animate-ping" />}
                  Generate Poem
                </Button>
              )}


              {poem && (
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <Button 
                    onClick={handleCopyPoem}
                    disabled={isLoading || !poem}
                    className="flex-1 text-base py-3 group"
                    variant="outline"
                    aria-label="Copy generated poem to clipboard"
                  >
                    <Copy className="mr-2 h-5 w-5 group-hover:animate-subtlePop" /> Copy
                  </Button>
                  <Button 
                    onClick={handleDownloadPoem} 
                    disabled={isLoading || !poem} 
                    className="flex-1 text-base py-3 group" 
                    variant="outline"
                    aria-label="Download generated poem as text file"
                  >
                    <Download className="mr-2 h-5 w-5 group-hover:animate-subtlePop" /> Download
                  </Button>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button 
                        onClick={handleShare} 
                        disabled={isLoading || !poem} 
                        className="flex-1 text-base py-3 group hover:shadow-primary/40 hover:shadow-lg" 
                        variant="default"
                        aria-label="Share generated poem"
                      >
                        <Share2 className="mr-2 h-5 w-5 group-hover:animate-subtlePop" /> Share
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-2 space-y-1 bg-card border-border shadow-xl rounded-md">
                        <p className="text-xs text-muted-foreground px-2 pb-1">Share via:</p>
                        <Button variant="ghost" size="sm" className="w-full justify-start gap-2" asChild>
                          <a href={`https://twitter.com/intent/tweet?text=${shareText}&url=${shareUrl}`} target="_blank" rel="noopener noreferrer">
                            <Twitter className="h-4 w-4 text-[#1DA1F2]" /> Twitter
                          </a>
                        </Button>
                        <Button variant="ghost" size="sm" className="w-full justify-start gap-2" asChild>
                           <a href={`https://www.facebook.com/sharer/sharer.php?u=${shareUrl}&quote=${shareText}`} target="_blank" rel="noopener noreferrer">
                            <Facebook className="h-4 w-4 text-[#1877F2]" /> Facebook
                          </a>
                        </Button>
                        <Button variant="ghost" size="sm" className="w-full justify-start gap-2" asChild>
                          <a href={`https://www.linkedin.com/shareArticle?mini=true&url=${shareUrl}&title=${shareTitle}&summary=${shareText}`} target="_blank" rel="noopener noreferrer">
                            <Linkedin className="h-4 w-4 text-[#0A66C2]" /> LinkedIn
                          </a>
                        </Button>
                         <Button variant="ghost" size="sm" className="w-full justify-start gap-2" onClick={() => {
                            navigator.clipboard.writeText((poem || "") + "\n" + window.location.href);
                            toast({ title: 'Copied!', description: 'Poem and link copied to clipboard.' });
                         }}>
                            <LinkIcon className="h-4 w-4" /> Copy Link & Text
                          </Button>
                    </PopoverContent>
                  </Popover>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </main>

      <footer className="p-6 border-t border-border/50 bg-card/80 text-center mt-8">
        <div className="container mx-auto">
          <PhotoPoetLogo className="mx-auto mb-3 h-10" />
          <p className="text-sm text-muted-foreground">
            &copy; {new Date().getFullYear()} PhotoPoet. Weaving words with light.
          </p>
          <p className="text-xs text-muted-foreground/80 mt-1.5">
            Powered by Generative AI &mdash; Crafted with Code
          </p>
        </div>
      </footer>
    </div>
  );
}


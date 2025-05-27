
// src/components/photo-poet-app.tsx
"use client";

import { useState, useRef, useEffect, useCallback } from 'react';
import Image from 'next/image';
import { useTheme } from 'next-themes';
import { 
  Upload, Share2, Settings2, RefreshCw, Loader2, Feather, 
  Image as ImageIcon, FileText, Sun, Moon, Download, LinkIcon, Twitter, Facebook, Linkedin, Copy, Palette
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
        toast({ title: 'Image Too Large', description: 'Please upload an image smaller than 5MB.', variant: 'destructive' });
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setImageDataUrl(reader.result as string);
        setPoem(null);
        setDisplayPoem(null);
        toast({ title: 'Image Loaded', description: 'Ready to conjure some verse.', variant: 'default', className: 'bg-primary text-primary-foreground' });
      };
      reader.readAsDataURL(file);
    }
  };

  const triggerFileUpload = () => {
    fileInputRef.current?.click();
  };

  const generatePoem = async () => {
    if (!imageDataUrl) {
      toast({ title: 'No Visual Muse', description: 'Please upload a photo first.', variant: 'destructive' });
      return;
    }
    setIsLoading(true);
    setPoem(null); 
    setDisplayPoem(null);

    const stylePreferences = `Tone: ${customTone || 'eloquent and insightful'}. Length: ${customLength || 'medium'}.`;
    const result = await handleGeneratePoem(imageDataUrl, stylePreferences);
    
    setIsLoading(false);
    if (result.success && result.poem) {
      setPoem(result.poem);
      toast({ title: 'Poetic Vision Realized!', description: 'Your masterpiece awaits its audience.', className: 'bg-accent text-accent-foreground' });
    } else {
      toast({ title: 'Creative Block Error', description: result.error || 'The muse is fickle. Please try again.', variant: 'destructive' });
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
      toast({ title: 'Verse Reshaped!', description: `Length preference '${customLength}' has been woven in.` });
    } else {
      toast({ title: 'Regeneration Stalled', description: result.error || 'Failed to adjust poem length.', variant: 'destructive' });
    }
  };

  const regenerateWithTone = async () => {
    if (!imageDataUrl || !poem || !customTone) {
      toast({ title: 'Missing Nuance', description: 'Please provide a tone to refine your poem.', variant: 'default' });
      return;
    }
    setIsLoading(true);
    setDisplayPoem(null);
    const result = await handleRegeneratePoemWithTone(imageDataUrl, customTone);
    setIsLoading(false);
    if (result.success && result.poem) {
      setPoem(result.poem);
      toast({ title: 'Poem Reimagined!', description: `The tone of '${customTone}' now echoes through your verse.` });
    } else {
      toast({ title: 'Regeneration Stalled', description: result.error || 'Failed to adjust poem tone.', variant: 'destructive' });
    }
  };

  const handleDownloadPoem = () => {
    if (!poem) {
      toast({ title: 'No Verse to Save', description: 'First, let the words flow.', variant: 'destructive' });
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
    toast({ title: 'Poem Secured!', description: 'Saved as PhotoPoem.txt.' });
  };

  const handleCopyPoem = () => {
    if (!poem) {
      toast({ title: 'No Verse to Copy', description: 'First, let the words flow.', variant: 'destructive' });
      return;
    }
    navigator.clipboard.writeText(poem);
    toast({ title: 'Poem Copied!', description: 'Your verse is ready for the world.' });
  };
  
  const handleShare = async () => {
    if (!poem || !imageDataUrl) {
      toast({ title: 'No Creation to Share', description: 'Generate a poem to share your inspiration.', variant: 'destructive' });
      return;
    }
    // For Popover, this function might just open the popover. The actual sharing happens in PopoverContent buttons.
  };

  const PoemDisplay = useCallback(() => {
    if (isLoading && !displayPoem) {
      const loadingMessages = ["Conjuring couplets...", "Forging poetic fire...", "Sculpting stanzas...", "Weaving words of wonder..."];
      const randomMessage = loadingMessages[Math.floor(Math.random() * loadingMessages.length)];
      return (
        <div className="p-6 text-center">
          <Loader2 className="h-10 w-10 animate-spin text-primary mx-auto mb-4" />
          <p className="text-muted-foreground italic text-sm mb-4">{randomMessage}</p>
          <div className="space-y-3.5">
            <Skeleton className="h-5 w-11/12 rounded-md bg-muted/40 mx-auto" />
            <Skeleton className="h-5 w-5/6 rounded-md bg-muted/40 mx-auto" />
            <Skeleton className="h-5 w-full rounded-md bg-muted/40 mx-auto" />
            <Skeleton className="h-5 w-4/6 rounded-md bg-muted/40 mx-auto" />
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
       return <p className="text-muted-foreground italic text-center py-12 px-6">Your visual muse awaits. Adjust preferences, then unveil the verse.</p>;
    }
    return (
      <div className="text-center py-12 px-6 flex flex-col items-center justify-center h-full">
        <Feather size={52} className="mb-5 text-primary opacity-60" />
        <p className="text-xl text-foreground/90 font-medium">Welcome to PhotoPoet</p>
        <p className="text-sm text-muted-foreground/80 mt-1.5">Transform your images into inspired lyrical art.</p>
      </div>
    );
  }, [isLoading, displayPoem, poem, imageDataUrl]);


  if (!mounted) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="h-14 w-14 animate-spin text-primary" />
      </div>
    );
  }

  const shareUrl = mounted ? encodeURIComponent(window.location.href) : "";
  const shareText = encodeURIComponent(poem || "Discover PhotoPoet: AI-Powered Poetry from Images!");
  const shareTitle = encodeURIComponent("A Poetic Vision by PhotoPoet");

  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground selection:bg-primary selection:text-primary-foreground">
      <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/80 backdrop-blur-lg supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto flex justify-between items-center p-4 h-[72px]"> {/* Increased height */}
          <div className="flex items-center gap-3">
            <PhotoPoetLogo className="h-14 w-auto" /> {/* Slightly larger logo */}
          </div>
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
              aria-label="Toggle theme"
              className="text-foreground/70 hover:text-foreground hover:bg-accent/10 rounded-full"
            >
              {theme === 'dark' ? <Sun className="h-[1.15rem] w-[1.15rem]" /> : <Moon className="h-[1.15rem] w-[1.15rem]" />}
            </Button>
          </div>
        </div>
      </header>

      <main className="flex-grow container mx-auto p-4 md:p-6 lg:p-8 animate-slideUp">
        <div className="grid md:grid-cols-2 gap-8 lg:gap-10"> {/* Increased gap */}
          
          <Card className="shadow-lg card-hover-elevate bg-card/80 border-border/50">
            <CardHeader className="pb-4">
              <CardTitle className="text-xl lg:text-2xl font-semibold flex items-center gap-3 text-primary">
                <ImageIcon className="h-6 w-6 lg:h-7 lg:w-7" /> Your Visual Muse
              </CardTitle>
              <CardDescription className="text-muted-foreground/90 pt-0.5">Upload an image to inspire a unique poem.</CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col items-center space-y-6"> {/* Increased space */}
              <div className="w-full aspect-[16/10] max-w-2xl bg-muted/30 rounded-lg overflow-hidden flex items-center justify-center border-2 border-dashed border-border/40 hover:border-primary/70 transition-colors duration-300 shadow-inner">
                {imageDataUrl ? (
                  <Image
                    src={imageDataUrl}
                    alt="Uploaded inspiration"
                    width={640} 
                    height={400}
                    className="object-contain w-full h-full animate-fadeIn"
                    data-ai-hint="user uploaded image"
                  />
                ) : (
                  <div className="flex flex-col items-center justify-center text-muted-foreground/70 p-8 text-center">
                    <ImageIcon size={60} className="mb-4 opacity-50" />
                    <p className="font-medium text-base">Your image canvas awaits.</p>
                    <p className="text-xs mt-1.5">Click below to select a photo and begin.</p>
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
                className="w-full max-w-sm text-base py-3 group hover:shadow-primary/30 hover:shadow-md" 
                variant="default"
                size="lg"
                aria-label={imageDataUrl ? 'Change uploaded photo' : 'Upload a photo'}
              >
                <Upload className="mr-2.5 h-5 w-5 group-hover:animate-bounce" /> {imageDataUrl ? 'Change Photo' : 'Select Photo'}
              </Button>
            </CardContent>
          </Card>

          <Card className="shadow-lg flex flex-col bg-card/80 border-border/50 card-hover-elevate">
            <CardHeader className="pb-4">
              <CardTitle className="text-xl lg:text-2xl font-semibold flex items-center gap-3 text-accent">
                <FileText className="h-6 w-6 lg:h-7 lg:w-7" /> Poetic Echoes
              </CardTitle>
              <CardDescription className="text-muted-foreground/90 pt-0.5">AI-crafted verse inspired by your image.</CardDescription>
            </CardHeader>
            <CardContent className="flex-grow space-y-6 flex flex-col justify-between"> {/* Increased space */}
              <div className="poem-text-display min-h-[220px] flex flex-col justify-center">
                <PoemDisplay />
              </div>
              
              {imageDataUrl && (
                <div className="space-y-5 p-5 border border-border/30 rounded-lg bg-muted/20 shadow-sm">
                  <div className="flex items-center justify-between mb-1">
                    <h3 className="text-lg font-semibold text-primary flex items-center gap-2.5">
                      <Palette className="h-5 w-5" /> {poem ? "Refine Your Verse" : "Set Preferences"}
                    </h3>
                  </div>
                  
                  <div className="grid sm:grid-cols-2 gap-5">
                    <div className="space-y-2.5">
                      <Label htmlFor="poemLength" className="text-sm font-medium text-foreground/80">Poem Length</Label>
                      <Select value={customLength} onValueChange={(value: PoemLength) => setCustomLength(value)}>
                        <SelectTrigger id="poemLength" className="bg-background hover:border-primary/50 focus:ring-primary/40 text-sm">
                          <SelectValue placeholder="Select length" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="short">Short &amp; Sweet</SelectItem>
                          <SelectItem value="medium" className="font-medium">Medium Verse</SelectItem>
                          <SelectItem value="long">Epic Tale</SelectItem>
                        </SelectContent>
                      </Select>
                      {poem && (
                         <Button onClick={regenerateWithLength} disabled={isLoading} variant="outline" className="w-full mt-2 group hover:border-primary hover:text-primary text-sm py-2.5">
                          {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <RefreshCw className="mr-2 h-4 w-4 group-hover:rotate-[270deg] transition-transform duration-300" />}
                          Apply Length
                        </Button>
                      )}
                    </div>

                    <div className="space-y-2.5">
                      <Label htmlFor="poemTone" className="text-sm font-medium text-foreground/80">Poem Tone</Label>
                      <Input
                        id="poemTone"
                        type="text"
                        value={customTone}
                        onChange={(e) => setCustomTone(e.target.value)}
                        placeholder="e.g., joyful, reflective, epic"
                        className="bg-background hover:border-primary/50 focus:ring-primary/40 text-sm"
                      />
                       {poem && (
                          <Button onClick={regenerateWithTone} disabled={isLoading || !customTone} variant="outline" className="w-full mt-2 group hover:border-primary hover:text-primary text-sm py-2.5">
                            {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <RefreshCw className="mr-2 h-4 w-4 group-hover:rotate-[270deg] transition-transform duration-300" />}
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
                  className="w-full text-base py-3 group hover:shadow-accent/30 hover:shadow-md"
                  variant="secondary"
                  size="lg"
                  aria-label="Generate poem from uploaded image"
                >
                  {isLoading ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : <Feather className="mr-2 h-5 w-5 group-hover:animate-ping" />}
                  Generate Poem
                </Button>
              )}


              {poem && (
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5 pt-2">
                  <Button 
                    onClick={handleCopyPoem}
                    disabled={isLoading || !poem}
                    className="flex-1 text-sm py-2.5 group"
                    variant="outline"
                    aria-label="Copy generated poem to clipboard"
                  >
                    <Copy className="mr-2 h-[1.1rem] w-[1.1rem] group-hover:animate-subtlePop" /> Copy
                  </Button>
                  <Button 
                    onClick={handleDownloadPoem} 
                    disabled={isLoading || !poem} 
                    className="flex-1 text-sm py-2.5 group" 
                    variant="outline"
                    aria-label="Download generated poem as text file"
                  >
                    <Download className="mr-2 h-[1.1rem] w-[1.1rem] group-hover:animate-subtlePop" /> Download
                  </Button>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button 
                        onClick={handleShare} 
                        disabled={isLoading || !poem} 
                        className="flex-1 text-sm py-2.5 group hover:shadow-primary/30 hover:shadow-md" 
                        variant="default"
                        aria-label="Share generated poem"
                      >
                        <Share2 className="mr-2 h-[1.1rem] w-[1.1rem] group-hover:animate-subtlePop" /> Share
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-2.5 space-y-1.5 bg-popover border-border shadow-xl rounded-lg">
                        <p className="text-xs text-muted-foreground px-2 pb-1.5">Share your verse:</p>
                        <Button variant="ghost" size="sm" className="w-full justify-start gap-2.5 text-sm hover:bg-accent/10" asChild>
                          <a href={`https://twitter.com/intent/tweet?text=${shareText}&url=${shareUrl}`} target="_blank" rel="noopener noreferrer">
                            <Twitter className="h-4 w-4 text-[#1DA1F2]" /> Twitter
                          </a>
                        </Button>
                        <Button variant="ghost" size="sm" className="w-full justify-start gap-2.5 text-sm hover:bg-accent/10" asChild>
                           <a href={`https://www.facebook.com/sharer/sharer.php?u=${shareUrl}&quote=${shareText}`} target="_blank" rel="noopener noreferrer">
                            <Facebook className="h-4 w-4 text-[#1877F2]" /> Facebook
                          </a>
                        </Button>
                        <Button variant="ghost" size="sm" className="w-full justify-start gap-2.5 text-sm hover:bg-accent/10" asChild>
                          <a href={`https://www.linkedin.com/shareArticle?mini=true&url=${shareUrl}&title=${shareTitle}&summary=${shareText}`} target="_blank" rel="noopener noreferrer">
                            <Linkedin className="h-4 w-4 text-[#0A66C2]" /> LinkedIn
                          </a>
                        </Button>
                         <Button variant="ghost" size="sm" className="w-full justify-start gap-2.5 text-sm hover:bg-accent/10" onClick={() => {
                            if (mounted) navigator.clipboard.writeText((poem || "") + "\n" + window.location.href);
                            toast({ title: 'Link & Poem Copied!', description: 'Ready to paste and share.' });
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

      <footer className="p-8 border-t border-border/30 bg-card/50 text-center mt-12"> {/* Increased padding, more subtle border */}
        <div className="container mx-auto">
          <PhotoPoetLogo className="mx-auto mb-3.5 h-9" /> {/* Smaller logo in footer */}
          <p className="text-xs text-muted-foreground"> 
            &copy; {new Date().getFullYear()} PhotoPoet. Weaving words with light, crafted with code.
          </p>
          <p className="text-xs text-muted-foreground/70 mt-1">
            Powered by Generative AI &mdash; Designed for Inspiration
          </p>
        </div>
      </footer>
    </div>
  );
}

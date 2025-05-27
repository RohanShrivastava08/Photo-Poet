// src/components/photo-poet-app.tsx
"use client";

import { useState, useRef, useEffect, useCallback } from 'react';
import Image from 'next/image';
import { Upload, Share2, Settings2, RefreshCw, Loader2, Feather, Image as ImageIcon, FileText } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { PhotoPoetLogo } from '@/components/icons/photo-poet-logo';
import { handleGeneratePoem, handleRegeneratePoemWithLength, handleRegeneratePoemWithTone } from '@/lib/actions';
import { Skeleton } from '@/components/ui/skeleton';

type PoemLength = 'short' | 'medium' | 'long';

export default function PhotoPoetApp() {
  const [imageDataUrl, setImageDataUrl] = useState<string | null>(null);
  const [poem, setPoem] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [customTone, setCustomTone] = useState('');
  const [customLength, setCustomLength] = useState<PoemLength>('medium');
  const [displayPoem, setDisplayPoem] = useState<string | null>(null);
  const [isInitialGeneration, setIsInitialGeneration] = useState(true);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  useEffect(() => {
    if (poem) {
      setDisplayPoem(null);
      setTimeout(() => setDisplayPoem(poem), 50);
    }
  }, [poem]);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) { // 5MB limit
        toast({ title: 'File too large', description: 'Please upload an image smaller than 5MB.', variant: 'destructive' });
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setImageDataUrl(reader.result as string);
        setPoem(null);
        setDisplayPoem(null);
        setIsInitialGeneration(true);
        toast({ title: 'Image Loaded', description: 'Ready to generate your poem.', variant: 'default' });
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
      setIsInitialGeneration(false);
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

  const handleShare = async () => {
    if (!poem || !imageDataUrl) {
      toast({ title: 'Nothing to Share', description: 'Generate a poem first to share your creation.', variant: 'destructive' });
      return;
    }
    const shareText = `Check out this poem I generated with PhotoPoet for my image:\n\n${poem}\n\n#PhotoPoet #AIpoetry`;
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'My PhotoPoem Creation',
          text: shareText,
        });
        toast({ title: 'Shared Successfully!', description: 'Your poem has been shared with the world.' });
      } catch (error) {
        // If user cancels share, it might throw an error or not, browser dependent.
        // console.warn('Share action was cancelled or failed:', error);
        // Only show error if it's a real error, not user cancellation.
        if (error && (error as Error).name !== 'AbortError') {
            toast({ title: 'Sharing Failed', description: 'Could not share the poem. Try copying instead.', variant: 'destructive' });
        }
      }
    } else {
      navigator.clipboard.writeText(shareText);
      toast({ title: 'Copied to Clipboard', description: 'Poem copied! You can paste it anywhere to share.' });
    }
  };
  
  const PoemDisplay = useCallback(() => {
    if (isLoading && !displayPoem) {
      return (
        <div className="space-y-3 p-2">
          <Skeleton className="h-5 w-full rounded-md" />
          <Skeleton className="h-5 w-5/6 rounded-md" />
          <Skeleton className="h-5 w-full rounded-md" />
          <Skeleton className="h-5 w-4/6 rounded-md" />
          <Skeleton className="h-5 w-full rounded-md" />
        </div>
      );
    }
    if (displayPoem) {
      return (
        <pre className={`whitespace-pre-wrap font-serif text-lg text-foreground/90 leading-relaxed animate-fadeIn p-2`}>
          {displayPoem}
        </pre>
      );
    }
    if (imageDataUrl && !poem && !isLoading) {
       return <p className="text-muted-foreground italic text-center py-8 px-4">Your canvas awaits transformation. Hit 'Generate Poem' to begin the magic.</p>;
    }
    return <p className="text-muted-foreground italic text-center py-8 px-4">Upload a photo and let Photo Poet weave words into your visuals.</p>;
  }, [isLoading, displayPoem, poem, imageDataUrl]);

  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground selection:bg-primary selection:text-primary-foreground">
      <header className="sticky top-0 z-50 w-full border-b border-border/60 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80 shadow-md">
        <div className="container mx-auto flex justify-between items-center p-4 h-20">
          <div className="flex items-center gap-2">
            <PhotoPoetLogo className="h-10 w-auto" />
            <h1 className="text-2xl md:text-3xl font-mono font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-primary via-accent to-primary">
              PhotoPoet
            </h1>
          </div>
          <Button 
            variant="outline" 
            size="lg" 
            onClick={triggerFileUpload} 
            aria-label="Upload new photo"
            className="hover:bg-primary hover:text-primary-foreground group"
          >
            <Upload className="mr-2 h-5 w-5 group-hover:animate-pulse" /> Upload
          </Button>
        </div>
      </header>

      <main className="flex-grow container mx-auto p-4 md:p-8 animate-slideUp">
        <div className="grid md:grid-cols-2 gap-6 lg:gap-10">
          
          {/* Photo Section */}
          <Card className="shadow-xl card-hover-elevate bg-card/80 border-border/50">
            <CardHeader className="pb-4">
              <CardTitle className="font-mono text-2xl flex items-center gap-2 text-primary">
                <ImageIcon className="h-7 w-7" /> Your Visual Muse
              </CardTitle>
              <CardDescription className="text-muted-foreground/80">Upload an image to inspire a unique poem.</CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col items-center space-y-6">
              <div className="w-full aspect-video max-w-2xl bg-muted/30 rounded-lg overflow-hidden flex items-center justify-center border-2 border-dashed border-border/40 hover:border-primary/70 transition-colors duration-300">
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
                  <div className="flex flex-col items-center justify-center text-muted-foreground/70 p-8">
                    <ImageIcon size={64} className="mb-4 opacity-50" />
                    <p className="text-center">Your image will appear here.</p>
                    <p className="text-xs text-center mt-1">Click below to upload.</p>
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
                className="w-full max-w-md text-lg py-6 group hover:shadow-primary/30 hover:shadow-lg" 
                variant="default"
                aria-label={imageDataUrl ? 'Change uploaded photo' : 'Upload a photo'}
              >
                <Upload className="mr-2 h-5 w-5 group-hover:animate-bounce" /> {imageDataUrl ? 'Change Photo' : 'Select Photo'}
              </Button>
            </CardContent>
          </Card>

          {/* Poem Section */}
          <Card className="shadow-xl flex flex-col bg-card/80 border-border/50 card-hover-elevate">
            <CardHeader className="pb-4">
              <CardTitle className="font-mono text-2xl flex items-center gap-2 text-accent">
                <FileText className="h-7 w-7" /> Poetic Echoes
              </CardTitle>
              <CardDescription className="text-muted-foreground/80">AI-crafted verse inspired by your image.</CardDescription>
            </CardHeader>
            <CardContent className="flex-grow space-y-6 flex flex-col justify-between">
              <div className="p-1 border border-border/30 rounded-lg bg-background/50 min-h-[250px] max-h-[400px] overflow-y-auto shadow-inner">
                <PoemDisplay />
              </div>
              
              {isInitialGeneration && imageDataUrl && (
                <Button 
                  onClick={generatePoem} 
                  disabled={isLoading || !imageDataUrl} 
                  className="w-full text-lg py-6 group hover:shadow-accent/30 hover:shadow-lg"
                  variant="secondary"
                  aria-label="Generate poem from uploaded image"
                >
                  {isLoading ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : <Feather className="mr-2 h-5 w-5 group-hover:animate-ping" />}
                  Generate Poem
                </Button>
              )}

              {(poem || (imageDataUrl && !isInitialGeneration)) && (
                <div className="space-y-4 p-4 border border-border/30 rounded-lg bg-muted/30 shadow-sm">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-xl font-semibold text-primary flex items-center gap-2">
                      <Settings2 className="h-6 w-6" />Refine Your Verse
                    </h3>
                  </div>
                  
                  <div className="grid sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="poemLength" className="text-sm font-medium text-foreground/80">Poem Length</Label>
                      <Select value={customLength} onValueChange={(value: PoemLength) => setCustomLength(value)}>
                        <SelectTrigger id="poemLength" className="bg-background hover:border-primary/50">
                          <SelectValue placeholder="Select length" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="short">Short &amp; Sweet</SelectItem>
                          <SelectItem value="medium">Medium Verse</SelectItem>
                          <SelectItem value="long">Epic Tale</SelectItem>
                        </SelectContent>
                      </Select>
                      {!isInitialGeneration && poem && (
                         <Button onClick={regenerateWithLength} disabled={isLoading} variant="outline" className="w-full mt-2 group hover:border-primary hover:text-primary">
                          {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <RefreshCw className="mr-2 h-4 w-4 group-hover:rotate-180 transition-transform duration-300" />}
                          Apply Length
                        </Button>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="poemTone" className="text-sm font-medium text-foreground/80">Poem Tone</Label>
                      <Input
                        id="poemTone"
                        type="text"
                        value={customTone}
                        onChange={(e) => setCustomTone(e.target.value)}
                        placeholder="e.g., joyful, reflective"
                        className="bg-background hover:border-primary/50"
                      />
                       {!isInitialGeneration && poem && (
                          <Button onClick={regenerateWithTone} disabled={isLoading || !customTone} variant="outline" className="w-full mt-2 group hover:border-primary hover:text-primary">
                            {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <RefreshCw className="mr-2 h-4 w-4 group-hover:rotate-180 transition-transform duration-300" />}
                            Apply Tone
                          </Button>
                       )}
                    </div>
                  </div>
                   {isInitialGeneration && imageDataUrl && !poem &&
                     <p className="text-xs text-muted-foreground/70 text-center pt-2">Set preferences before generation, or refine your poem after it's created.</p>
                   }
                </div>
              )}

              {poem && (
                <Button 
                  onClick={handleShare} 
                  disabled={isLoading || !poem} 
                  className="w-full text-lg py-6 group hover:shadow-primary/30 hover:shadow-lg" 
                  variant="default"
                  aria-label="Share generated poem"
                >
                  <Share2 className="mr-2 h-5 w-5 group-hover:animate-subtlePop" /> Share Poem
                </Button>
              )}
            </CardContent>
          </Card>
        </div>
      </main>

      <footer className="p-6 border-t border-border/40 bg-card/50 text-center">
        <div className="container mx-auto">
          <PhotoPoetLogo className="mx-auto mb-2 h-8" />
          <p className="text-sm text-muted-foreground">
            &copy; {new Date().getFullYear()} PhotoPoet. Weaving words with light.
          </p>
          <p className="text-xs text-muted-foreground/70 mt-1">
            Powered by Generative AI
          </p>
        </div>
      </footer>
    </div>
  );
}

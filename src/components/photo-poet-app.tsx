// src/components/photo-poet-app.tsx
"use client";

import { useState, useRef, useEffect, useCallback } from 'react';
import Image from 'next/image';
import { Upload, Share2, Settings2, RefreshCw, Loader2, Feather } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
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
      // Trigger fade-in animation by updating displayPoem
      setDisplayPoem(null); // Clear previous poem to ensure re-triggering animation class
      setTimeout(() => setDisplayPoem(poem), 50); // Short delay to allow DOM update
    }
  }, [poem]);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImageDataUrl(reader.result as string);
        setPoem(null);
        setDisplayPoem(null);
        setIsInitialGeneration(true);
      };
      reader.readAsDataURL(file);
    }
  };

  const triggerFileUpload = () => {
    fileInputRef.current?.click();
  };

  const generatePoem = async () => {
    if (!imageDataUrl) {
      toast({ title: 'Error', description: 'Please upload a photo first.', variant: 'destructive' });
      return;
    }
    setIsLoading(true);
    setPoem(null); // Clear previous poem
    setDisplayPoem(null);

    const stylePreferences = `Tone: ${customTone || 'neutral'}. Length: ${customLength || 'medium'}.`;
    const result = await handleGeneratePoem(imageDataUrl, stylePreferences);
    
    setIsLoading(false);
    if (result.success && result.poem) {
      setPoem(result.poem);
      setIsInitialGeneration(false);
      toast({ title: 'Poem Generated!', description: 'Your masterpiece is ready.' });
    } else {
      toast({ title: 'Error', description: result.error || 'Failed to generate poem.', variant: 'destructive' });
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
      toast({ title: 'Poem Regenerated!', description: 'Length preference applied.' });
    } else {
      toast({ title: 'Error', description: result.error || 'Failed to regenerate poem.', variant: 'destructive' });
    }
  };

  const regenerateWithTone = async () => {
    if (!imageDataUrl || !poem || !customTone) {
      toast({ title: 'Notice', description: 'Please enter a tone preference.', variant: 'default' });
      return;
    }
    setIsLoading(true);
    setDisplayPoem(null);
    const result = await handleRegeneratePoemWithTone(imageDataUrl, customTone);
    setIsLoading(false);
    if (result.success && result.poem) {
      setPoem(result.poem);
      toast({ title: 'Poem Regenerated!', description: 'Tone preference applied.' });
    } else {
      toast({ title: 'Error', description: result.error || 'Failed to regenerate poem.', variant: 'destructive' });
    }
  };

  const handleShare = async () => {
    if (!poem || !imageDataUrl) {
      toast({ title: 'Nothing to share', description: 'Generate a poem first.', variant: 'destructive' });
      return;
    }
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'My PhotoPoem',
          text: `Check out this poem I generated with PhotoPoet:\n\n${poem}`,
          // url: window.location.href, // You might want to share a link to the image/poem if hosted
        });
        toast({ title: 'Shared!', description: 'Your poem has been shared.' });
      } catch (error) {
        toast({ title: 'Sharing failed', description: 'Could not share the poem.', variant: 'destructive' });
      }
    } else {
      // Fallback for browsers that don't support navigator.share
      // You could copy to clipboard here
      navigator.clipboard.writeText(`My PhotoPoem:\n\n${poem}`);
      toast({ title: 'Copied to clipboard', description: 'Poem copied. You can paste it to share.' });
    }
  };
  
  const PoemDisplay = useCallback(() => {
    if (isLoading && !displayPoem) {
      return (
        <div className="space-y-2">
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-3/4" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-1/2" />
        </div>
      );
    }
    if (displayPoem) {
      return (
        <pre className={`whitespace-pre-wrap font-sans text-foreground leading-relaxed animate-fadeIn`}>
          {displayPoem}
        </pre>
      );
    }
    if (imageDataUrl && !poem) {
       return <p className="text-muted-foreground italic">Ready to transform your photo into poetry?</p>;
    }
    return <p className="text-muted-foreground italic">Your generated poem will appear here. Upload a photo to begin!</p>;
  }, [isLoading, displayPoem, poem, imageDataUrl]);


  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground">
      <header className="p-4 border-b border-border shadow-sm">
        <div className="container mx-auto flex justify-between items-center">
          <PhotoPoetLogo />
          <h1 className="text-3xl font-mono font-bold text-primary hidden sm:block">
            Photo Poet
          </h1>
          <Button variant="ghost" size="icon" onClick={triggerFileUpload} aria-label="Upload new photo">
            <Upload className="h-5 w-5" />
          </Button>
        </div>
      </header>

      <div className="flex-grow container mx-auto p-4 md:p-8">
        <div className="grid md:grid-cols-2 gap-8">
          {/* Photo Section */}
          <Card className="shadow-lg">
            <CardHeader>
              <CardTitle className="font-mono text-2xl">Your Photo</CardTitle>
              <CardDescription>Upload an image to inspire a poem.</CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col items-center space-y-4">
              <div className="w-full aspect-square max-w-md bg-muted rounded-lg overflow-hidden flex items-center justify-center border border-dashed">
                {imageDataUrl ? (
                  <Image
                    src={imageDataUrl}
                    alt="Uploaded photo"
                    width={500}
                    height={500}
                    className="object-contain w-full h-full animate-fadeIn"
                    data-ai-hint="user uploaded"
                  />
                ) : (
                  <Image
                    src="https://placehold.co/500x500.png"
                    alt="Placeholder"
                    width={500}
                    height={500}
                    className="object-contain opacity-50"
                    data-ai-hint="abstract art"
                  />
                )}
              </div>
              <Input
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                ref={fileInputRef}
                className="hidden"
                aria-label="Photo upload input"
              />
              <Button onClick={triggerFileUpload} className="w-full max-w-xs" variant="outline">
                <Upload className="mr-2 h-4 w-4" /> {imageDataUrl ? 'Change Photo' : 'Upload Photo'}
              </Button>
            </CardContent>
          </Card>

          {/* Poem Section */}
          <Card className="shadow-lg flex flex-col">
            <CardHeader>
              <CardTitle className="font-mono text-2xl">Generated Poem</CardTitle>
              <CardDescription>AI-crafted verse inspired by your image.</CardDescription>
            </CardHeader>
            <CardContent className="flex-grow space-y-6 flex flex-col justify-between">
              <div className="p-4 border rounded-lg bg-card min-h-[200px] overflow-y-auto">
                <PoemDisplay />
              </div>
              
              {isInitialGeneration && imageDataUrl && (
                <Button onClick={generatePoem} disabled={isLoading || !imageDataUrl} className="w-full">
                  {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Feather className="mr-2 h-4 w-4" />}
                  Generate Poem
                </Button>
              )}

              {/* Customization Options - shown after initial generation or if photo is present */}
              {(poem || imageDataUrl) && (
                <div className="space-y-4 p-4 border rounded-lg bg-muted/50">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-semibold text-primary">Customize</h3>
                    <Settings2 className="h-5 w-5 text-primary" />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="poemLength">Poem Length</Label>
                    <Select value={customLength} onValueChange={(value: PoemLength) => setCustomLength(value)}>
                      <SelectTrigger id="poemLength">
                        <SelectValue placeholder="Select length" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="short">Short</SelectItem>
                        <SelectItem value="medium">Medium</SelectItem>
                        <SelectItem value="long">Long</SelectItem>
                      </SelectContent>
                    </Select>
                    {!isInitialGeneration && poem && (
                       <Button onClick={regenerateWithLength} disabled={isLoading} variant="outline" className="w-full mt-2">
                        {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <RefreshCw className="mr-2 h-4 w-4" />}
                        Regenerate with new Length
                      </Button>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="poemTone">Poem Tone (e.g., happy, melancholic)</Label>
                    <Input
                      id="poemTone"
                      type="text"
                      value={customTone}
                      onChange={(e) => setCustomTone(e.target.value)}
                      placeholder="e.g., joyful, reflective"
                    />
                     {!isInitialGeneration && poem && (
                        <Button onClick={regenerateWithTone} disabled={isLoading || !customTone} variant="outline" className="w-full mt-2">
                          {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <RefreshCw className="mr-2 h-4 w-4" />}
                          Regenerate with new Tone
                        </Button>
                     )}
                  </div>
                   {isInitialGeneration && imageDataUrl && !poem &&
                     <p className="text-xs text-muted-foreground">Set preferences before initial generation, or refine after.</p>
                   }
                </div>
              )}

              {poem && (
                <Button onClick={handleShare} disabled={isLoading || !poem} className="w-full" variant="default">
                  <Share2 className="mr-2 h-4 w-4" /> Share Poem
                </Button>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      <footer className="p-4 border-t text-center text-sm text-muted-foreground">
        <p>&copy; {new Date().getFullYear()} Photo Poet. Create magic with words and images.</p>
      </footer>
    </div>
  );
}


// src/components/photo-poet-app.tsx
"use client";

import { useState, useRef, useEffect, useCallback } from 'react';
import Image from 'next/image';
import { useTheme } from 'next-themes';
import { 
  Upload, Share2, RefreshCw, Loader2, Feather, 
  Image as ImageIcon, FileText, Sun, Moon, Download, LinkIcon, Twitter, Facebook, Linkedin, Copy, Palette, HelpCircle, MessageSquareQuote, Sparkles
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
import { Separator } from '@/components/ui/separator';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';

type PoemLength = 'short' | 'medium' | 'long';

const EXAMPLE_IMAGE_URL = 'https://images.unsplash.com/photo-1542362567-b07e54358753?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8NDV8fGNhcnxlbnwwfHwwfHx8MA%3D%3D';
const EXAMPLE_IMAGE_HINT = "vintage car";
const EXAMPLE_POEM = `Wheels of time, now hushed and still,
Beneath the sun, on a silent hill.
Chrome whispers tales of roads once known,
A classic beauty, uniquely sown.`;

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
    // Animation for newly generated poems
    if (poem && displayPoem !== poem) {
      setDisplayPoem(null); 
      const timer = setTimeout(() => setDisplayPoem(poem), 50); 
      return () => clearTimeout(timer);
    }
    // If poem is cleared (e.g. new image upload), clear displayPoem
    if (!poem && displayPoem) {
        setDisplayPoem(null);
    }
  }, [poem, displayPoem]);


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
        toast({ title: 'Image Loaded', description: 'Ready to conjure some verse.', className: 'bg-primary text-primary-foreground' });
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
  
  const PoemDisplay = useCallback(() => {
    if (isLoading && !displayPoem) {
      const loadingMessages = ["Conjuring couplets...", "Forging poetic fire...", "Sculpting stanzas...", "Weaving words of wonder...", "Drafting lyrical lines..."];
      const randomMessage = loadingMessages[Math.floor(Math.random() * loadingMessages.length)];
      return (
        <div className="p-6 text-center space-y-4">
          <Loader2 className="h-12 w-12 animate-spin text-primary mx-auto" />
          <p className="text-muted-foreground italic text-sm">{randomMessage}</p>
          <div className="space-y-3.5 pt-2">
            <Skeleton className="h-5 w-11/12 rounded-md bg-muted/30 mx-auto" />
            <Skeleton className="h-5 w-5/6 rounded-md bg-muted/30 mx-auto" />
            <Skeleton className="h-5 w-full rounded-md bg-muted/30 mx-auto" />
            <Skeleton className="h-5 w-4/6 rounded-md bg-muted/30 mx-auto" />
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
       return <p className="text-muted-foreground italic text-center py-16 px-6">Your visual muse awaits. Adjust preferences, then unveil the verse.</p>;
    }
    // Initial state when no image is uploaded yet
    return (
      <div className="text-center py-16 px-6 flex flex-col items-center justify-center h-full">
        <Feather size={56} className="mb-6 text-primary opacity-50" />
        <p className="text-xl text-foreground/80 font-medium">Craft a Poem from Your Photo</p>
        <p className="text-sm text-muted-foreground/70 mt-2 max-w-xs mx-auto">Upload an image to begin generating your unique poetic masterpiece.</p>
      </div>
    );
  }, [isLoading, displayPoem, poem, imageDataUrl]);

  const faqItems = [
    {
      value: "item-1",
      question: "What kind of images work best?",
      answer: "PhotoPoet can draw inspiration from any image! Clearer images with distinct subjects, colors, and moods often yield more evocative poems. Experiment to see what magic unfolds!",
    },
    {
      value: "item-2",
      question: "Can I edit the poem after it's generated?",
      answer: "Currently, you can regenerate the poem with different length and tone preferences using the controls. Direct text editing within the app is not yet supported, but you can easily copy the poem and edit it in your favorite text editor.",
    },
    {
      value: "item-3",
      question: "How is the poem generated?",
      answer: "PhotoPoet uses advanced generative AI. The AI analyzes the visual elements, themes, and emotions it perceives in your uploaded image to compose a unique poem tailored to your photo.",
    },
    {
      value: "item-4",
      question: "Is my uploaded image stored anywhere?",
      answer: "No, your images are processed in real-time solely for the purpose of generating the poem and are not stored on our servers. Your privacy is important to us.",
    },
  ];


  if (!mounted) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="h-16 w-16 animate-spin text-primary" />
      </div>
    );
  }

  const shareUrl = mounted ? encodeURIComponent(window.location.href) : "";
  const shareText = encodeURIComponent(poem || "Discover PhotoPoet: AI-Powered Poetry from Images!");
  const shareTitle = encodeURIComponent("A Poetic Vision by PhotoPoet");

  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground selection:bg-primary selection:text-primary-foreground">
      <header className="sticky top-0 z-50 w-full border-b border-border/60 bg-background/90 backdrop-blur-lg supports-[backdrop-filter]:bg-background/75">
        <div className="container mx-auto flex justify-between items-center p-4 h-[76px]">
          <div className="flex items-center gap-3">
            <PhotoPoetLogo className="h-16 w-auto" />
          </div>
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
              aria-label="Toggle theme"
              className="text-foreground/70 hover:text-foreground hover:bg-accent/10 rounded-full w-10 h-10"
            >
              {theme === 'dark' ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
            </Button>
          </div>
        </div>
      </header>

      <main className="flex-grow container mx-auto p-4 md:p-6 lg:p-8 animate-slideUp">
        <div className="grid md:grid-cols-2 gap-8 lg:gap-12">
          
          <Card className="shadow-lg card-hover-elevate bg-card border-border/70">
            <CardHeader className="pb-4">
              <CardTitle className="text-xl lg:text-2xl font-semibold flex items-center gap-3 text-primary">
                <ImageIcon className="h-7 w-7" /> Your Visual Muse
              </CardTitle>
              <CardDescription className="text-muted-foreground/80 pt-1">
                Select a photo, and watch as words weave its story.
              </CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col items-center space-y-6 pt-2">
              <div className="w-full aspect-[16/10] max-w-2xl bg-muted/20 rounded-lg overflow-hidden flex items-center justify-center border-2 border-dashed border-border/50 hover:border-primary/60 transition-colors duration-300 shadow-inner">
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
                  <div className="flex flex-col items-center justify-center text-muted-foreground/60 p-8 text-center">
                    <ImageIcon size={64} className="mb-5 opacity-40" />
                    <p className="font-medium text-base">Your image canvas awaits.</p>
                    <p className="text-xs mt-1.5">Click below to select a photo and begin your poetic journey.</p>
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
                className="w-full max-w-md text-base py-3.5 group hover:shadow-primary/20 hover:shadow-lg" 
                variant="default"
                size="lg"
                aria-label={imageDataUrl ? 'Change uploaded photo' : 'Upload a new photo'}
              >
                <Upload className="mr-2.5 h-5 w-5 transition-transform group-hover:translate-y-[-2px]" /> 
                {imageDataUrl ? 'Change Photo' : 'Upload New Photo'}
              </Button>
            </CardContent>
          </Card>

          <Card className="shadow-lg flex flex-col bg-card border-border/70 card-hover-elevate">
            <CardHeader className="pb-4">
              <CardTitle className="text-xl lg:text-2xl font-semibold flex items-center gap-3 text-accent">
                <FileText className="h-7 w-7" /> Poetic Echoes
              </CardTitle>
              <CardDescription className="text-muted-foreground/80 pt-1">
                 Verse inspired by your image will unfold here.
              </CardDescription>
            </CardHeader>
            <CardContent className="flex-grow space-y-6 flex flex-col justify-between pt-2"> 
              <div className="poem-text-display flex flex-col justify-center">
                <PoemDisplay />
              </div>
              
              {imageDataUrl && (
                <div className="space-y-5 p-5 border border-border/40 rounded-lg bg-background shadow-sm mt-4">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-lg font-semibold text-primary flex items-center gap-2.5">
                      <Palette className="h-5 w-5" /> 
                      {poem ? "Refine Your Verse" : "Set Preferences"}
                    </h3>
                  </div>
                  
                  <div className="grid sm:grid-cols-2 gap-x-5 gap-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="poemLength" className="text-sm font-medium text-foreground/90">Poem Length</Label>
                      <Select value={customLength} onValueChange={(value: PoemLength) => setCustomLength(value)}>
                        <SelectTrigger id="poemLength" className="bg-input hover:border-primary/50 focus:ring-primary/40 text-sm">
                          <SelectValue placeholder="Select length" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="short">Short & Sweet</SelectItem>
                          <SelectItem value="medium" className="font-medium">Medium Verse</SelectItem>
                          <SelectItem value="long">Epic Tale</SelectItem>
                        </SelectContent>
                      </Select>
                      {poem && (
                         <Button onClick={regenerateWithLength} disabled={isLoading} variant="outline" className="w-full mt-2.5 group hover:border-primary hover:text-primary text-sm py-2.5">
                          {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <RefreshCw className="mr-2 h-4 w-4 group-hover:rotate-[270deg] transition-transform duration-300" />}
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
                        className="bg-input hover:border-primary/50 focus:ring-primary/40 text-sm"
                      />
                       {poem && (
                          <Button onClick={regenerateWithTone} disabled={isLoading || !customTone} variant="outline" className="w-full mt-2.5 group hover:border-primary hover:text-primary text-sm py-2.5">
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
                  className="w-full text-base py-3.5 group hover:shadow-accent/20 hover:shadow-lg mt-4"
                  variant="secondary"
                  size="lg"
                  aria-label="Generate poem from uploaded image"
                >
                  {isLoading ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : <Feather className="mr-2 h-5 w-5 transition-transform group-hover:scale-110" />}
                  Generate Poem
                </Button>
              )}


              {poem && ( 
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5 pt-4">
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
                        disabled={isLoading || !poem} 
                        className="flex-1 text-sm py-2.5 group hover:shadow-primary/20 hover:shadow-md" 
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

        <Separator className="my-10 md:my-14 lg:my-16 bg-border/50" />

        <section className="text-center max-w-3xl mx-auto animate-fadeIn" style={{animationDelay: '0.3s'}}>
          <div className="flex justify-center mb-5">
            <HelpCircle className="h-10 w-10 text-accent opacity-80" />
          </div>
          <h2 className="text-2xl lg:text-3xl font-semibold mb-4 text-foreground/90">How PhotoPoet Works</h2>
          <p className="text-muted-foreground/90 leading-relaxed text-sm md:text-base lg:text-lg">
            Welcome to PhotoPoet! Unleash your creativity by transforming your favorite images into unique, AI-generated poems. 
            Simply <strong className="text-primary/90">upload a photo</strong> that inspires you. Our intelligent muse will then <strong className="text-accent/90">craft a verse</strong> reflecting its essence. 
            After the initial creation, or even before, you can <strong className="text-primary/90">set preferences for the poem's tone and length</strong> to perfectly match your vision. 
            It&apos;s a new way to find inspiration, express yourself, and see your pictures in a completely different light.
          </p>
          <p className="text-muted-foreground/80 mt-5 text-sm md:text-base">
            Ready to begin? Just <strong className="text-primary/90">select a photo</strong> using the panel above and let the magic unfold!
          </p>
        </section>

        <Separator className="my-10 md:my-14 lg:my-16 bg-border/50" />

        <section className="text-center max-w-3xl mx-auto animate-fadeIn" style={{animationDelay: '0.45s'}}>
          <div className="flex justify-center mb-5">
            <Sparkles className="h-10 w-10 text-accent opacity-80" />
          </div>
          <h2 className="text-2xl lg:text-3xl font-semibold mb-6 text-foreground/90">See PhotoPoet in Action: An Example</h2>
          <div className="grid md:grid-cols-2 gap-6 lg:gap-8 items-stretch mt-6 text-left bg-card/50 p-6 md:p-8 rounded-xl border border-border/60 shadow-lg">
            <div className="bg-card p-1 rounded-lg shadow-md border border-border/50 flex items-center justify-center">
              <Image
                src={EXAMPLE_IMAGE_URL}
                alt="Example of a vintage car"
                width={600}
                height={400}
                className="rounded-md object-contain w-full h-auto max-h-[300px]"
                data-ai-hint={EXAMPLE_IMAGE_HINT}
                priority 
              />
            </div>
            <div className="bg-card p-6 rounded-lg shadow-md border border-border/50 h-full flex flex-col">
              <h3 className="text-xl font-semibold text-primary mb-3">Inspired Verse:</h3>
              <pre className="poem-text-display !min-h-0 !p-4 !text-sm flex-grow overflow-y-auto">
                {EXAMPLE_POEM}
              </pre>
            </div>
          </div>
        </section>

        <Separator className="my-10 md:my-14 lg:my-16 bg-border/50" />

        <section className="max-w-3xl mx-auto animate-fadeIn" style={{animationDelay: '0.6s'}}>
          <div className="flex flex-col items-center mb-6">
            <MessageSquareQuote className="h-10 w-10 text-accent opacity-80 mb-3" />
            <h2 className="text-2xl lg:text-3xl font-semibold text-foreground/90">Frequently Asked Questions</h2>
          </div>
          <Accordion type="single" collapsible className="w-full">
            {faqItems.map((item) => (
              <AccordionItem value={item.value} key={item.value} className="border-border/70">
                <AccordionTrigger className="text-left hover:no-underline text-base lg:text-lg font-medium text-foreground/90 hover:text-primary transition-colors py-5">
                  {item.question}
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground/90 text-sm md:text-base leading-relaxed pb-5">
                  {item.answer}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </section>
      </main>

      <footer className="p-8 border-t border-border/50 bg-card/60 text-center mt-16"> 
        <div className="container mx-auto">
          <PhotoPoetLogo className="mx-auto mb-4 h-10" />
          <p className="text-xs text-muted-foreground/80"> 
            &copy; {new Date().getFullYear()} PhotoPoet. Weaving words with light, crafted with code.
          </p>
          <p className="text-xs text-muted-foreground/70 mt-1.5">
            Powered by Generative AI &mdash; Designed for Inspiration
          </p>
        </div>
      </footer>
    </div>
  );
}


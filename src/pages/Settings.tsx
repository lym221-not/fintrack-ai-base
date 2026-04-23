import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const Settings = () => {
  const [generatedCode, setGeneratedCode] = useState<string>("");
  const [showCode, setShowCode] = useState<boolean>(false);

  const generateCode = () => {
    const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
    let code = "LINK-";
    for (let i = 0; i < 6; i++) {
      code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setGeneratedCode(code);
    setShowCode(true);
  };

  const copyToClipboard = async () => {
    if (generatedCode) {
      await navigator.clipboard.writeText(generatedCode);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      {/* Header */}
      <div className="mb-8">
        <div className="text-primary font-mono-dm tracking-widest text-xs uppercase mb-2">
          Preferences
        </div>
        <h1 className="font-display text-3xl text-foreground">Settings</h1>
      </div>

      {/* Card 1 - Account */}
      <Card className="mb-6">
        <CardContent className="p-6">
          <div className="text-sm font-semibold text-foreground mb-4">Account</div>
          
          <div className="space-y-4">
            <Input 
              type="email" 
              placeholder="user@example.com" 
              className="w-full"
            />
            
            <div className="grid grid-cols-2 gap-4">
              <Select defaultValue="THB">
                <SelectTrigger>
                  <SelectValue placeholder="Currency" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="THB">THB — Thai Baht</SelectItem>
                  <SelectItem value="USD">USD — US Dollar</SelectItem>
                  <SelectItem value="EUR">EUR — Euro</SelectItem>
                  <SelectItem value="GBP">GBP — British Pound</SelectItem>
                </SelectContent>
              </Select>
              
              <Select defaultValue="Asia/Bangkok">
                <SelectTrigger>
                  <SelectValue placeholder="Timezone" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Asia/Bangkok">Asia/Bangkok</SelectItem>
                  <SelectItem value="Asia/Singapore">Asia/Singapore</SelectItem>
                  <SelectItem value="UTC">UTC</SelectItem>
                  <SelectItem value="America/New_York">America/New_York</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <Button className="w-full rounded-xl bg-primary text-primary-foreground hover:bg-primary/90">
              Save
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Card 2 - Connect Telegram */}
      <Card className="mb-6 border border-blue/30">
        <CardContent className="p-6">
          {/* Header */}
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="bg-blue/10 rounded-lg p-2">
                <svg className="h-5 w-5 text-blue" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm4.64 6.56c-.21 2.24-1.13 7.67-1.6 10.17-.2 1.07-.59 1.43-.96 1.46-.82.07-1.44-.54-2.23-1.06-1.24-.81-1.94-1.32-3.14-2.11-1.39-.91-.49-1.41.3-2.23.21-.22 3.86-3.54 3.93-3.84.01-.04.01-.09-.02-.13-.03-.04-.08-.03-.12-.02-.05.01-4.28 2.72-6.06 3.96-.57.39-1.09.38-1.61-.04-.76-.58-2.42-1.84-3.14-2.39-.67-.52-.03-1.01.15-1.21 1.03-1.01 2.07-2.01 3.12-3.01.21-.2.39-.19.1-.01z"/>
                </svg>
              </div>
              <div>
                <div className="font-semibold text-foreground">Connect Telegram</div>
                <div className="text-muted-foreground text-xs">Log transactions by chatting with the AI bot</div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full rounded-full bg-amber animate-pulse-dot" />
              </span>
              <span className="text-amber text-xs">Not connected</span>
            </div>
          </div>

          {/* Steps Box */}
          <div className="bg-background border border-border rounded-lg p-4 mb-4">
            <div className="space-y-2">
              <div className="flex items-start gap-3">
                <span className="text-primary font-mono-dm">1.</span>
                <span className="text-foreground text-sm">Click "Generate Code" below</span>
              </div>
              <div className="flex items-start gap-3">
                <span className="text-primary font-mono-dm">2.</span>
                <span className="text-foreground text-sm">Open Telegram and message @FinTrackAIBot</span>
              </div>
              <div className="flex items-start gap-3">
                <span className="text-primary font-mono-dm">3.</span>
                <span className="text-foreground text-sm">Send the code to link your account</span>
              </div>
            </div>
          </div>

          {/* Generate Code Button or Code Display */}
          {!showCode ? (
            <Button 
              onClick={generateCode}
              className="w-full rounded-xl bg-blue/10 text-blue border border-blue/20 hover:bg-blue/20"
            >
              Generate Code
            </Button>
          ) : (
            <div className="flex gap-2">
              <div className="bg-card border border-primary/30 rounded-lg px-4 py-2.5 flex-1">
                <div className="font-mono-dm text-primary text-lg tracking-widest text-center">
                  {generatedCode}
                </div>
              </div>
              <Button 
                onClick={copyToClipboard}
                variant="outline"
                className="px-4 py-2"
              >
                Copy
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Card 3 - Danger Zone */}
      <Card className="border border-expense/20">
        <CardContent className="p-6">
          <div className="text-expense text-sm font-semibold mb-2">Danger Zone</div>
          <p className="text-muted-foreground text-xs mb-4">
            Permanently delete your account and all associated data. This cannot be undone.
          </p>
          <Button 
            variant="outline"
            className="bg-expense/10 text-expense hover:bg-expense/20 rounded-xl px-4 py-2 text-sm font-medium border-0"
          >
            Delete Account
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default Settings;

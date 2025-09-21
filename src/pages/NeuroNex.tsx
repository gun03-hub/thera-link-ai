import { useState } from "react";
import { Bot, SendHorizonal } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

export default function NeuroNex() {
  const [messages, setMessages] = useState<{ role: "user" | "assistant"; content: string }[]>([
    { role: "assistant", content: "Hi, I'm NeuroNex. How can I support you today?" },
  ]);
  const [text, setText] = useState("");

  const send = () => {
    if (!text.trim()) return;
    const userMsg = { role: "user" as const, content: text.trim() };
    const reply = generateReply(text.trim());
    setMessages((m) => [...m, userMsg, { role: "assistant", content: reply }]);
    setText("");
  };

  const generateReply = (t: string) => {
    const l = t.toLowerCase();
    if (/(i feel|feeling)?\s*(bad|sad|down|depressed|not good|terrible)/.test(l)) {
      return "I'm here with you. What happened today? We can unpack it together, or I can guide a short grounding exercise.";
    }
    if (/(can we|let's)?\s*(talk|speak|chat)/.test(l) || l.includes("need to talk")) {
      return "Absolutely—I'm here to talk now. What's coming up for you? If you'd like a live session, head to Appointments in your dashboard.";
    }
    if (l.includes("prep")) return "I can help prepare for your session: set an intention and review recent reflections.";
    if (l.includes("anxiety")) return "Let's try a short grounding exercise: 5 senses check-in. Name 5 things you can see.";
    if (l.includes("resources")) return "I can recommend mindfulness PDFs, breathing videos, and CBT worksheets.";
    if (l.includes("help")) return "You're not alone—share a bit more. If this is urgent, please contact local emergency services.";
    return "I'm here to listen and guide. Share what's on your mind, or ask for an exercise.";
  };

  return (
    <div className="min-h-screen bg-background p-4">
      <div className="max-w-3xl mx-auto">
        <Card className="shadow-therapy-medium">
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><Bot className="h-5 w-5" /> NeuroNex</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[60vh] border rounded-md p-4 overflow-auto bg-muted/20">
              <div className="space-y-2">
                {messages.map((m, i) => (
                  <div key={i} className={cn("max-w-[80%] p-2 rounded-md", m.role === "user" ? "ml-auto bg-primary text-primary-foreground" : "mr-auto bg-accent")}>{m.content}</div>
                ))}
              </div>
            </div>
            <div className="mt-3 flex gap-2">
              <Input value={text} onChange={(e)=>setText(e.target.value)} placeholder="Type a message" onKeyDown={(e)=>{ if(e.key==='Enter') send(); }} />
              <Button onClick={send}><SendHorizonal className="h-4 w-4" /></Button>
            </div>
            <div className="mt-2 text-xs text-muted-foreground">Note: Demo assistant for UX only. Connect a backend to power real responses.</div>
          </CardContent>
        </Card>
        <div className="mt-4 flex justify-center">
          <Button asChild variant="outline"><a href="/">Back to Home</a></Button>
        </div>
      </div>
    </div>
  );
}

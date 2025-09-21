import { useEffect, useMemo, useState } from "react";
import {
  SidebarProvider,
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarInset,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarSeparator,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { Bot, CalendarDays, CheckCircle, FileText, Home, Library, LineChart, NotebookPen, Video } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Calendar } from "@/components/ui/calendar";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { Line, LineChart as RLineChart, XAxis, YAxis } from "recharts";
import { cn } from "@/lib/utils";

interface Appointment {
  id: string;
  date: string; // ISO
  time: string; // HH:mm
  therapist: string;
  joinUrl?: string;
}

interface CheckIn {
  id: string;
  date: string; // ISO
  mood: number; // 1-10
  note: string;
}

interface ResourceItem {
  id: string;
  title: string;
  type: "pdf" | "video" | "exercise" | "link";
  url: string;
}

const readLS = <T,>(key: string, fallback: T): T => {
  try {
    const v = localStorage.getItem(key);
    return v ? (JSON.parse(v) as T) : fallback;
  } catch {
    return fallback;
  }
};
const writeLS = (k: string, v: unknown) => {
  try { localStorage.setItem(k, JSON.stringify(v)); } catch {}
};

export default function PatientDashboard() {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [checkIns, setCheckIns] = useState<CheckIn[]>([]);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  const [chatMessages, setChatMessages] = useState<{ role: "patient" | "assistant"; content: string }[]>([
    { role: "assistant", content: "How are you feeling today?" },
  ]);
  const [chatInput, setChatInput] = useState("");
  const [journal, setJournal] = useState("");
  const [mood, setMood] = useState(5);

  useEffect(() => {
    const seedAppts = readLS<Appointment[]>("theralink:patient:appointments", []);
    if (seedAppts.length === 0) {
      const today = new Date();
      const iso = (d: Date) => d.toISOString().slice(0, 10);
      const base: Appointment[] = [
        { id: "a1", date: iso(today), time: "15:00", therapist: "Dr. Taylor", joinUrl: "/session/a1" },
        { id: "a2", date: iso(new Date(today.getTime() + 86400000 * 3)), time: "11:00", therapist: "Dr. Taylor", joinUrl: "/session/a2" },
      ];
      writeLS("theralink:patient:appointments", base);
    }

    let cis = readLS<CheckIn[]>("theralink:patient:checkins", []);
    if (cis.length === 0) {
      const days = 10;
      const arr: CheckIn[] = Array.from({ length: days }, (_, i) => {
        const d = new Date();
        d.setDate(d.getDate() - (days - 1 - i));
        return { id: `ci_seed_${i}`, date: d.toISOString().slice(0,10), mood: 4 + Math.floor(Math.random()*6), note: "" };
      });
      cis = arr;
      writeLS("theralink:patient:checkins", arr);
    }

    setAppointments(readLS<Appointment[]>("theralink:patient:appointments", []));
    setCheckIns(cis);
  }, []);

  const upcoming = useMemo(() => {
    const today = new Date().toISOString().slice(0, 10);
    return appointments.filter((a) => a.date >= today).sort((a,b)=> a.date.localeCompare(b.date) || a.time.localeCompare(b.time));
  }, [appointments]);

  const moodSeries = useMemo(() => {
    const byDate = [...checkIns].sort((a,b)=> a.date.localeCompare(b.date));
    return byDate.map((c) => ({ day: c.date.slice(5), mood: c.mood }));
  }, [checkIns]);

  const handleDailyCheckIn = () => {
    if (!selectedDate) return;
    const item: CheckIn = { id: `ci${Date.now()}`, date: selectedDate.toISOString().slice(0,10), mood, note: journal.trim() };
    const next = [...checkIns.filter((c) => !(c.date === item.date)), item];
    setCheckIns(next);
    writeLS("theralink:patient:checkins", next);
    setJournal("");
  };

  const handleChatSend = () => {
    if (!chatInput.trim()) return;
    const next = [...chatMessages, { role: "patient", content: chatInput.trim() }];
    const reply = generateAssistantReply(chatInput.trim());
    setChatMessages([...next, { role: "assistant", content: reply }]);
    setChatInput("");
  };

  const generateAssistantReply = (text: string) => {
    const l = text.toLowerCase();
    if (l.includes("anxious") || l.includes("stress")) return "Let's try a 4-7-8 breathing exercise and a 2-minute grounding scan.";
    if (l.includes("sleep")) return "Consider a wind-down routine: no screens 1h before bed and a short body scan.";
    if (l.includes("journal")) return "Prompt: What went well today? Name three things you're grateful for.";
    return "I can guide you with check-ins, exercises, and reflections. Tell me what's on your mind.";
  };

  const patientResources: ResourceItem[] = readLS("theralink:resources", []).filter((r: any) => Array.isArray(r.sharedWithClientIds));

  return (
    <SidebarProvider>
      <Sidebar collapsible="icon">
        <SidebarHeader>
          <div className="flex items-center gap-2 px-2 py-1.5">
            <div className="h-6 w-6 rounded-md bg-primary" />
            <span className="font-semibold">TheraLink</span>
          </div>
        </SidebarHeader>
        <SidebarContent>
          <SidebarGroup>
            <SidebarGroupLabel>Patient</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                <SidebarMenuItem>
                  <SidebarMenuButton asChild>
                    <a href="#overview"><Home /> <span>Overview</span></a>
                  </SidebarMenuButton>
                </SidebarMenuItem>
                <SidebarMenuItem>
                  <SidebarMenuButton asChild>
                    <a href="#chat"><Bot /> <span>AI Companion</span></a>
                  </SidebarMenuButton>
                </SidebarMenuItem>
                <SidebarMenuItem>
                  <SidebarMenuButton asChild>
                    <a href="#appointments"><CalendarDays /> <span>Appointments</span></a>
                  </SidebarMenuButton>
                </SidebarMenuItem>
                <SidebarMenuItem>
                  <SidebarMenuButton asChild>
                    <a href="#history"><NotebookPen /> <span>Notes & Journal</span></a>
                  </SidebarMenuButton>
                </SidebarMenuItem>
                <SidebarMenuItem>
                  <SidebarMenuButton asChild>
                    <a href="#progress"><LineChart /> <span>Progress</span></a>
                  </SidebarMenuButton>
                </SidebarMenuItem>
                <SidebarMenuItem>
                  <SidebarMenuButton asChild>
                    <a href="#resources"><Library /> <span>Resources</span></a>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        </SidebarContent>
        <SidebarSeparator />
        <SidebarFooter>
          <Button asChild variant="outline" className="w-full">
            <a href="/">Back to Home</a>
          </Button>
        </SidebarFooter>
      </Sidebar>
      <SidebarInset>
        <div className="flex items-center gap-2 p-4 border-b">
          <SidebarTrigger />
          <div className="font-semibold">Patient Dashboard</div>
        </div>
        <div className="p-4 space-y-8">
          {/* Overview quick stats */}
          <section id="overview" className="space-y-4">
            <div className="grid gap-4 grid-cols-1 md:grid-cols-3">
              <StatCard title="Upcoming" value={upcoming.length} icon={<CalendarDays className="h-4 w-4" />} />
              <StatCard title="Check-ins this month" value={checkIns.filter(c => c.date.slice(0,7) === new Date().toISOString().slice(0,7)).length} icon={<CheckCircle className="h-4 w-4" />} />
              <StatCard title="Resources" value={patientResources.length} icon={<Library className="h-4 w-4" />} />
            </div>
          </section>

          {/* AI Chat + Daily check-in */}
          <section id="chat" className="grid lg:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2"><Bot className="h-4 w-4" /> Personalized AI</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="border rounded-md p-3 h-64 overflow-auto bg-muted/20">
                  <div className="space-y-2">
                    {chatMessages.map((m, i) => (
                      <div key={i} className={cn("max-w-[80%] p-2 rounded-md", m.role === "patient" ? "ml-auto bg-primary text-primary-foreground" : "mr-auto bg-accent")}>{m.content}</div>
                    ))}
                  </div>
                </div>
                <div className="flex gap-2 mt-3">
                  <Input value={chatInput} onChange={(e)=>setChatInput(e.target.value)} placeholder="Share how you're feeling or ask for an exercise" />
                  <Button onClick={handleChatSend}>Send</Button>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>Daily check-in</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-2 gap-3">
                  <div>
                    <Calendar mode="single" selected={selectedDate} onSelect={setSelectedDate} className="rounded-md border" />
                  </div>
                  <div className="space-y-3">
                    <label className="grid gap-2">
                      <span className="text-sm">Mood (1-10)</span>
                      <input type="range" min={1} max={10} value={mood} onChange={(e)=>setMood(Number(e.target.value))} />
                      <div className="text-sm text-muted-foreground">Current: {mood}</div>
                    </label>
                    <label className="grid gap-2">
                      <span className="text-sm">Journal</span>
                      <Textarea value={journal} onChange={(e)=>setJournal(e.target.value)} placeholder="Write a short reflection" />
                    </label>
                    <Button onClick={handleDailyCheckIn} className="w-full">Save check-in</Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </section>

          {/* Appointments */}
          <section id="appointments" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2"><CalendarDays className="h-4 w-4" /> Upcoming appointments</CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Date</TableHead>
                      <TableHead>Time</TableHead>
                      <TableHead>Therapist</TableHead>
                      <TableHead>Action</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {upcoming.map((a) => (
                      <TableRow key={a.id}>
                        <TableCell>{a.date}</TableCell>
                        <TableCell>{a.time}</TableCell>
                        <TableCell>{a.therapist}</TableCell>
                        <TableCell>
                          <Button asChild size="sm">
                            <a href={a.joinUrl || "#"}><Video className="h-4 w-4 mr-1" /> Join</a>
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                    {upcoming.length === 0 && (
                      <TableRow>
                        <TableCell colSpan={4} className="text-center text-muted-foreground">No upcoming appointments</TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </section>

          {/* Notes & History */}
          <section id="history" className="grid lg:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2"><FileText className="h-4 w-4" /> Session notes</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">Notes shared by your therapist will appear here after sessions.</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>Journal entries</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 max-h-60 overflow-auto">
                  {checkIns.map((c) => (
                    <div key={c.id} className="p-2 border rounded-md">
                      <div className="text-xs text-muted-foreground">{c.date} • Mood {c.mood}</div>
                      {c.note && <div className="text-sm mt-1">{c.note}</div>}
                    </div>
                  ))}
                  {checkIns.length === 0 && <div className="text-sm text-muted-foreground">No journal entries yet</div>}
                </div>
              </CardContent>
            </Card>
          </section>

          {/* Progress */}
          <section id="progress" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2"><LineChart className="h-4 w-4" /> Mood tracking</CardTitle>
              </CardHeader>
              <CardContent>
                <ChartContainer config={{ mood: { label: "Mood", color: "hsl(var(--primary))" } }} className="w-full h-64">
                  <RLineChart data={moodSeries}>
                    <XAxis dataKey="day" tickLine={false} axisLine={false} />
                    <YAxis domain={[0, 10]} tickLine={false} axisLine={false} />
                    <ChartTooltip content={<ChartTooltipContent />} />
                    <Line type="monotone" dataKey="mood" stroke="var(--color-mood)" strokeWidth={2} dot={false} />
                  </RLineChart>
                </ChartContainer>
              </CardContent>
            </Card>
          </section>

          {/* Resources */}
          <section id="resources" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2"><Library className="h-4 w-4" /> Resources</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-2 gap-3">
                  {patientResources.map((r: any) => (
                    <div key={r.id} className="p-3 border rounded-md flex items-center justify-between">
                      <div>
                        <div className="font-medium">{r.title}</div>
                        <div className="text-xs text-muted-foreground">{String(r.type).toUpperCase()}</div>
                      </div>
                      <a className="text-primary text-sm underline" href={r.url} target="_blank">Open</a>
                    </div>
                  ))}
                  {patientResources.length === 0 && <div className="text-sm text-muted-foreground">No shared resources</div>}
                </div>
              </CardContent>
            </Card>
          </section>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}

function StatCard({ title, value, icon }: { title: string; value: number | string; icon?: React.ReactNode }) {
  return (
    <Card className="bg-gradient-to-br from-primary/10 via-accent/10 to-secondary/10 border-0">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm flex items-center gap-2">
          <span className="inline-flex items-center justify-center p-1.5 rounded-md bg-background/60">{icon}</span>
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="text-3xl font-bold text-primary">{value}</div>
      </CardContent>
    </Card>
  );
}

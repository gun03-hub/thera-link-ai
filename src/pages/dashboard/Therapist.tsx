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
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarSeparator,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import {
  CalendarDays,
  Clock,
  FileText,
  Home,
  Library,
  ListChecks,
  Settings,
  Users,
  Bot,
  DollarSign,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { cn } from "@/lib/utils";

// Types
interface Client {
  id: string;
  name: string;
  email: string;
  status: "active" | "inactive";
  goals: string[];
}

interface SessionItem {
  id: string;
  clientId: string;
  clientName: string;
  date: string; // ISO
  time: string; // HH:mm
  notesPending: boolean;
  reminderEnabled: boolean;
}

interface TaskItem {
  id: string;
  title: string;
  due: string; // ISO date
  done: boolean;
}

interface ResourceItem {
  id: string;
  title: string;
  type: "pdf" | "video" | "exercise" | "link";
  url: string;
  sharedWithClientIds: string[];
}

interface InvoiceItem {
  id: string;
  clientName: string;
  amount: number;
  status: "paid" | "unpaid" | "overdue";
  date: string; // ISO
}

// Storage helpers
const readLS = <T,>(key: string, fallback: T): T => {
  try {
    const v = localStorage.getItem(key);
    return v ? (JSON.parse(v) as T) : fallback;
  } catch {
    return fallback;
  }
};

const writeLS = (key: string, value: unknown) => {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    /* ignore */
  }
};

const seedIfEmpty = () => {
  const clients = readLS<Client[]>("theralink:clients", []);
  if (clients.length === 0) {
    const seedClients: Client[] = [
      { id: "c1", name: "Alex Johnson", email: "alex@example.com", status: "active", goals: ["Reduce anxiety", "Improve sleep"] },
      { id: "c2", name: "Priya Singh", email: "priya@example.com", status: "active", goals: ["Manage stress", "Daily journaling"] },
      { id: "c3", name: "Luis Martinez", email: "luis@example.com", status: "inactive", goals: ["Mindfulness routine"] },
    ];
    writeLS("theralink:clients", seedClients);
  }
  const sessions = readLS<SessionItem[]>("theralink:sessions", []);
  if (sessions.length === 0) {
    const today = new Date();
    const iso = (d: Date) => d.toISOString().slice(0, 10);
    const seedSessions: SessionItem[] = [
      { id: "s1", clientId: "c1", clientName: "Alex Johnson", date: iso(today), time: "10:00", notesPending: true, reminderEnabled: true },
      { id: "s2", clientId: "c2", clientName: "Priya Singh", date: iso(new Date(today.getTime() + 86400000)), time: "14:00", notesPending: false, reminderEnabled: true },
    ];
    writeLS("theralink:sessions", seedSessions);
  }
  const tasks = readLS<TaskItem[]>("theralink:tasks", []);
  if (tasks.length === 0) {
    const seedTasks: TaskItem[] = [
      { id: "t1", title: "Complete Alex's session notes", due: new Date().toISOString().slice(0, 10), done: false },
      { id: "t2", title: "Share CBT worksheet with Priya", due: new Date().toISOString().slice(0, 10), done: false },
    ];
    writeLS("theralink:tasks", seedTasks);
  }
  const resources = readLS<ResourceItem[]>("theralink:resources", []);
  if (resources.length === 0) {
    const seedResources: ResourceItem[] = [
      { id: "r1", title: "Mindfulness Basics PDF", type: "pdf", url: "https://example.com/mindfulness.pdf", sharedWithClientIds: ["c1", "c2"] },
      { id: "r2", title: "Breathing Exercise Video", type: "video", url: "https://example.com/breathing.mp4", sharedWithClientIds: ["c1"] },
    ];
    writeLS("theralink:resources", seedResources);
  }
  const invoices = readLS<InvoiceItem[]>("theralink:invoices", []);
  if (invoices.length === 0) {
    const seedInvoices: InvoiceItem[] = [
      { id: "i1", clientName: "Alex Johnson", amount: 120, status: "paid", date: new Date().toISOString() },
      { id: "i2", clientName: "Priya Singh", amount: 120, status: "unpaid", date: new Date().toISOString() },
    ];
    writeLS("theralink:invoices", seedInvoices);
  }
};

export default function TherapistDashboard() {
  const [clients, setClients] = useState<Client[]>([]);
  const [sessions, setSessions] = useState<SessionItem[]>([]);
  const [tasks, setTasks] = useState<TaskItem[]>([]);
  const [resources, setResources] = useState<ResourceItem[]>([]);
  const [invoices, setInvoices] = useState<InvoiceItem[]>([]);

  const authUser = readLS<any>("theralink:auth:user", null);
  const isTherapistPending = !!(authUser && authUser.role === "Therapist" && authUser.status !== "active");

  const [search, setSearch] = useState("");
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  const [newSession, setNewSession] = useState<{ clientId: string; time: string; reminderEnabled: boolean }>({
    clientId: "",
    time: "09:00",
    reminderEnabled: true,
  });

  const [chatMessages, setChatMessages] = useState<{ role: "therapist" | "assistant"; content: string }[]>([
    { role: "assistant", content: "How can I help with your next session?" },
  ]);
  const [chatInput, setChatInput] = useState("");

  // Resources form state
  const [resTitle, setResTitle] = useState("");
  const [resType, setResType] = useState<ResourceItem["type"]>("pdf");
  const [resUrl, setResUrl] = useState("");
  const [resShare, setResShare] = useState<string>("all");

  useEffect(() => {
    seedIfEmpty();
    setClients(readLS<Client[]>("theralink:clients", []));
    setSessions(readLS<SessionItem[]>("theralink:sessions", []));
    setTasks(readLS<TaskItem[]>("theralink:tasks", []));
    setResources(readLS<ResourceItem[]>("theralink:resources", []));
    setInvoices(readLS<InvoiceItem[]>("theralink:invoices", []));
  }, []);

  const upcoming = useMemo(() => {
    const today = new Date().toISOString().slice(0, 10);
    return sessions
      .filter((s) => s.date >= today)
      .sort((a, b) => a.date.localeCompare(b.date) || a.time.localeCompare(b.time))
      .slice(0, 5);
  }, [sessions]);

  const activeClients = useMemo(() => clients.filter((c) => c.status === "active"), [clients]);
  const pendingNotes = useMemo(() => sessions.filter((s) => s.notesPending), [sessions]);

  const handleAddSession = () => {
    if (!selectedDate || !newSession.clientId) return;
    const client = clients.find((c) => c.id === newSession.clientId);
    if (!client) return;
    const dateISO = selectedDate.toISOString().slice(0, 10);
    const item: SessionItem = {
      id: `s${Date.now()}`,
      clientId: client.id,
      clientName: client.name,
      date: dateISO,
      time: newSession.time,
      notesPending: true,
      reminderEnabled: newSession.reminderEnabled,
    };
    const next = [...sessions, item];
    setSessions(next);
    writeLS("theralink:sessions", next);
  };

  const handleShareResource = (payload: Omit<ResourceItem, "id">) => {
    const item: ResourceItem = { id: `r${Date.now()}`, ...payload };
    const next = [item, ...resources];
    setResources(next);
    writeLS("theralink:resources", next);
  };

  const handleToggleTask = (id: string) => {
    const next = tasks.map((t) => (t.id === id ? { ...t, done: !t.done } : t));
    setTasks(next);
    writeLS("theralink:tasks", next);
  };

  const handleChatSend = () => {
    if (!chatInput.trim()) return;
    const next = [...chatMessages, { role: "therapist", content: chatInput.trim() }];
    // Very basic local assistant reply
    const reply = generateAssistantReply(chatInput.trim());
    setChatMessages([...next, { role: "assistant", content: reply }]);
    setChatInput("");
  };

  const generateAssistantReply = (prompt: string) => {
    const lower = prompt.toLowerCase();
    if (lower.includes("summary") || lower.includes("summarize")) {
      return "I'll draft a session summary outline: goals reviewed, techniques used (CBT breathing), and next steps.";
    }
    if (lower.includes("resource") || lower.includes("worksheet")) {
      return "Recommended sharing: Mindfulness Basics PDF and a 4-7-8 breathing exercise video.";
    }
    if (lower.includes("prep") || lower.includes("prepare")) {
      return "Preparation tips: review client's last mood trends, confirm goals, have grounding exercise ready.";
    }
    return "I can help with session prep, summaries, or tailored resources. Ask me for specifics.";
  };

  const filteredClients = useMemo(() => {
    const q = search.toLowerCase();
    return clients.filter((c) => c.name.toLowerCase().includes(q) || c.email.toLowerCase().includes(q));
  }, [clients, search]);

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
            <SidebarGroupLabel>Therapist</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                <SidebarMenuItem>
                  <SidebarMenuButton asChild>
                    <a href="#overview"><Home /> <span>Overview</span></a>
                  </SidebarMenuButton>
                </SidebarMenuItem>
                <SidebarMenuItem>
                  <SidebarMenuButton asChild>
                    <a href="#clients"><Users /> <span>Clients</span></a>
                  </SidebarMenuButton>
                  <SidebarMenuSub>
                    <li>
                      <SidebarMenuSubButton href="#clients-list">All Clients</SidebarMenuSubButton>
                    </li>
                    <li>
                      <SidebarMenuSubButton href="#clients-profile">Profile</SidebarMenuSubButton>
                    </li>
                  </SidebarMenuSub>
                </SidebarMenuItem>
                <SidebarMenuItem>
                  <SidebarMenuButton asChild>
                    <a href="#calendar"><CalendarDays /> <span>Calendar</span></a>
                  </SidebarMenuButton>
                </SidebarMenuItem>
                <SidebarMenuItem>
                  <SidebarMenuButton asChild>
                    <a href="#resources"><Library /> <span>Resources</span></a>
                  </SidebarMenuButton>
                </SidebarMenuItem>
                <SidebarMenuItem>
                  <SidebarMenuButton asChild>
                    <a href="#billing"><DollarSign /> <span>Billing</span></a>
                  </SidebarMenuButton>
                </SidebarMenuItem>
                <SidebarMenuItem>
                  <SidebarMenuButton asChild>
                    <a href="#notes"><FileText /> <span>Notes</span></a>
                  </SidebarMenuButton>
                </SidebarMenuItem>
                <SidebarMenuItem>
                  <SidebarMenuButton asChild>
                    <a href="#tasks"><ListChecks /> <span>Tasks</span></a>
                  </SidebarMenuButton>
                </SidebarMenuItem>
                <SidebarMenuItem>
                  <SidebarMenuButton asChild>
                    <a href="#ai"><Bot /> <span>AI Assistant</span></a>
                  </SidebarMenuButton>
                </SidebarMenuItem>
                <SidebarMenuItem>
                  <SidebarMenuButton asChild>
                    <a href="#settings"><Settings /> <span>Settings</span></a>
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
          <div className="font-semibold">Therapist Dashboard</div>
        </div>
        <div className="p-4 space-y-8">
          {/* Overview */}
          <section id="overview" className="space-y-4">
            <div className="grid gap-4 grid-cols-1 md:grid-cols-4">
              <StatCard title="Upcoming sessions" value={upcoming.length} icon={<Clock className="h-4 w-4" />} />
              <StatCard title="Active patients" value={activeClients.length} icon={<Users className="h-4 w-4" />} />
              <StatCard title="Pending notes" value={pendingNotes.length} icon={<FileText className="h-4 w-4" />} />
              <StatCard title="Open tasks" value={tasks.filter((t) => !t.done).length} icon={<ListChecks className="h-4 w-4" />} />
            </div>

            <div className="grid gap-4 grid-cols-1 lg:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2"><Clock className="h-4 w-4" /> Upcoming sessions</CardTitle>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Client</TableHead>
                        <TableHead>Date</TableHead>
                        <TableHead>Time</TableHead>
                        <TableHead>Reminder</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {upcoming.map((s) => (
                        <TableRow key={s.id}>
                          <TableCell>{s.clientName}</TableCell>
                          <TableCell>{s.date}</TableCell>
                          <TableCell>{s.time}</TableCell>
                          <TableCell className="text-muted-foreground">{s.reminderEnabled ? "On" : "Off"}</TableCell>
                        </TableRow>
                      ))}
                      {upcoming.length === 0 && (
                        <TableRow>
                          <TableCell colSpan={4} className="text-center text-muted-foreground">No upcoming sessions</TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2"><Users className="h-4 w-4" /> Active patients</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex gap-2 mb-3">
                    <Input placeholder="Search clients" value={search} onChange={(e) => setSearch(e.target.value)} />
                  </div>
                  <div className="space-y-2 max-h-80 overflow-auto">
                    {filteredClients.map((c) => (
                      <div key={c.id} className="p-3 rounded-md border flex items-center justify-between">
                        <div>
                          <div className="font-medium">{c.name}</div>
                          <div className="text-xs text-muted-foreground">{c.email}</div>
                        </div>
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button variant="outline" size="sm">View</Button>
                          </DialogTrigger>
                          <DialogContent className="sm:max-w-lg">
                            <DialogHeader>
                              <DialogTitle>Client profile</DialogTitle>
                            </DialogHeader>
                            <div className="space-y-4">
                              <div>
                                <div className="font-semibold">{c.name}</div>
                                <div className="text-sm text-muted-foreground">{c.email}</div>
                              </div>
                              <div>
                                <div className="font-semibold mb-1">Goals</div>
                                <ul className="list-disc list-inside text-sm text-muted-foreground">
                                  {c.goals.map((g, i) => (<li key={i}>{g}</li>))}
                                </ul>
                              </div>
                              <div>
                                <div className="font-semibold mb-1">Recent sessions</div>
                                <ul className="text-sm text-muted-foreground space-y-1 max-h-40 overflow-auto">
                                  {sessions.filter((s) => s.clientId === c.id).map((s) => (
                                    <li key={s.id}>{s.date} at {s.time}</li>
                                  ))}
                                </ul>
                              </div>
                              <div>
                                <div className="font-semibold mb-1">Shared resources</div>
                                <ul className="text-sm text-muted-foreground space-y-1 max-h-40 overflow-auto">
                                  {resources.filter((r) => r.sharedWithClientIds.includes(c.id)).map((r) => (
                                    <li key={r.id} className="flex items-center justify-between">
                                      <span>{r.title}</span>
                                      <a className="text-primary text-xs underline" href={r.url} target="_blank">Open</a>
                                    </li>
                                  ))}
                                </ul>
                              </div>
                            </div>
                          </DialogContent>
                        </Dialog>
                      </div>
                    ))}
                    {filteredClients.length === 0 && (
                      <div className="text-center text-sm text-muted-foreground">No clients</div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          </section>

          {/* Calendar & Scheduling */}
          <section id="calendar" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2"><CalendarDays className="h-4 w-4" /> Appointments & Scheduling</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <Calendar mode="single" selected={selectedDate} onSelect={setSelectedDate} className="rounded-md border" />
                  </div>
                  <div className="space-y-3">
                    <div className="grid gap-2">
                      <Label>Client</Label>
                      <Select value={newSession.clientId} onValueChange={(v) => setNewSession((s) => ({ ...s, clientId: v }))}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select client" />
                        </SelectTrigger>
                        <SelectContent>
                          {clients.map((c) => (
                            <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="grid gap-2">
                      <Label>Time</Label>
                      <Input type="time" value={newSession.time} onChange={(e) => setNewSession((s) => ({ ...s, time: e.target.value }))} />
                    </div>
                    <div className="grid gap-2">
                      <Label>Automated reminders</Label>
                      <Select value={newSession.reminderEnabled ? "on" : "off"} onValueChange={(v) => setNewSession((s) => ({ ...s, reminderEnabled: v === "on" }))}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="on">On</SelectItem>
                          <SelectItem value="off">Off</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <Button onClick={handleAddSession} className="w-full">Add session</Button>

                    <div className="pt-4">
                      <div className="font-medium mb-2">Sessions on selected date</div>
                      <div className="space-y-2 max-h-48 overflow-auto">
                        {sessions.filter((s) => selectedDate && s.date === selectedDate.toISOString().slice(0, 10)).map((s) => (
                          <div key={s.id} className="p-2 border rounded-md flex items-center justify-between">
                            <div>
                              <div className="font-medium">{s.clientName}</div>
                              <div className="text-xs text-muted-foreground">{s.time}</div>
                            </div>
                            <Button variant="outline" size="sm">Edit</Button>
                          </div>
                        ))}
                        {selectedDate && sessions.filter((s) => s.date === selectedDate.toISOString().slice(0, 10)).length === 0 && (
                          <div className="text-sm text-muted-foreground">No sessions on this date</div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
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
                <div className="grid md:grid-cols-3 gap-3">
                  <div className="grid gap-2">
                    <Label>Title</Label>
                    <Input placeholder="Resource title" value={resTitle} onChange={(e)=>setResTitle(e.target.value)} />
                  </div>
                  <div className="grid gap-2">
                    <Label>Type</Label>
                    <Select value={resType} onValueChange={(v: ResourceItem["type"])=>setResType(v)}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="pdf">PDF</SelectItem>
                        <SelectItem value="video">Video</SelectItem>
                        <SelectItem value="exercise">Exercise</SelectItem>
                        <SelectItem value="link">Link</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="grid gap-2">
                    <Label>URL</Label>
                    <Input placeholder="https://..." value={resUrl} onChange={(e)=>setResUrl(e.target.value)} />
                  </div>
                </div>
                <div className="grid md:grid-cols-2 gap-3 mt-3">
                  <div className="grid gap-2">
                    <Label>Share with</Label>
                    <Select value={resShare} onValueChange={(v)=>setResShare(v)}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All active clients</SelectItem>
                        {clients.map((c) => (
                          <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="flex items-end">
                    <Button
                      className="w-full"
                      onClick={() => {
                        const title = resTitle.trim();
                        const url = resUrl.trim();
                        if (!title || !url) return;
                        const sharedWithClientIds = resShare === "all" ? clients.filter(c=>c.status==='active').map((c)=>c.id) : [resShare];
                        handleShareResource({ title, url, type: resType, sharedWithClientIds });
                        setResTitle("");
                        setResUrl("");
                        setResType("pdf");
                        setResShare("all");
                      }}
                    >
                      Add resource
                    </Button>
                  </div>
                </div>

                <div className="mt-6">
                  <div className="font-medium mb-2">Shared resources</div>
                  <div className="grid md:grid-cols-2 gap-3">
                    {resources.map((r) => (
                      <div key={r.id} className="p-3 border rounded-md flex items-center justify-between">
                        <div>
                          <div className="font-medium">{r.title}</div>
                          <div className="text-xs text-muted-foreground">{r.type.toUpperCase()} · Shared with {r.sharedWithClientIds.length} client(s)</div>
                        </div>
                        <a className="text-primary text-sm underline" target="_blank" href={r.url}>Open</a>
                      </div>
                    ))}
                    {resources.length === 0 && <div className="text-sm text-muted-foreground">No resources</div>}
                  </div>
                </div>
              </CardContent>
            </Card>
          </section>

          {/* Billing */}
          <section id="billing" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2"><DollarSign className="h-4 w-4" /> Invoices</CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Client</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead>Amount</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {invoices.map((i) => (
                      <TableRow key={i.id}>
                        <TableCell>{i.clientName}</TableCell>
                        <TableCell>{new Date(i.date).toLocaleDateString()}</TableCell>
                        <TableCell>${i.amount.toFixed(2)}</TableCell>
                        <TableCell>
                          <span className={cn(
                            "px-2 py-1 rounded text-xs",
                            i.status === "paid" && "bg-green-100 text-green-700",
                            i.status === "unpaid" && "bg-yellow-100 text-yellow-800",
                            i.status === "overdue" && "bg-red-100 text-red-700",
                          )}>
                            {i.status}
                          </span>
                        </TableCell>
                      </TableRow>
                    ))}
                    {invoices.length === 0 && (
                      <TableRow>
                        <TableCell colSpan={4} className="text-center text-muted-foreground">No invoices</TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </section>

          {/* Notes & Tasks */}
          <section id="notes" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2"><FileText className="h-4 w-4" /> Pending notes</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {pendingNotes.map((s) => (
                    <div key={s.id} className="p-3 border rounded-md">
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="font-medium">{s.clientName}</div>
                          <div className="text-xs text-muted-foreground">{s.date} at {s.time}</div>
                        </div>
                        <Button variant="outline" size="sm" onClick={() => {
                          const content = prompt("Enter session note summary") || "";
                          if (!content) return;
                          const next = sessions.map((x) => x.id === s.id ? { ...x, notesPending: false } : x);
                          setSessions(next);
                          writeLS("theralink:sessions", next);
                        }}>Mark completed</Button>
                      </div>
                    </div>
                  ))}
                  {pendingNotes.length === 0 && <div className="text-sm text-muted-foreground">No pending notes</div>}
                </div>
              </CardContent>
            </Card>
          </section>

          <section id="tasks" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2"><ListChecks className="h-4 w-4" /> Tasks</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex gap-2 mb-3">
                  <Input placeholder="New task" id="new-task" />
                  <Button onClick={() => {
                    const el = document.getElementById("new-task") as HTMLInputElement | null;
                    const title = el?.value.trim() || "";
                    if (!title) return;
                    const item: TaskItem = { id: `t${Date.now()}`, title, due: new Date().toISOString().slice(0,10), done: false };
                    const next = [item, ...tasks];
                    setTasks(next);
                    writeLS("theralink:tasks", next);
                    if (el) el.value = "";
                  }}>Add</Button>
                </div>
                <div className="space-y-2">
                  {tasks.map((t) => (
                    <label key={t.id} className="flex items-center gap-3 p-2 border rounded-md">
                      <input type="checkbox" checked={t.done} onChange={() => handleToggleTask(t.id)} />
                      <span className={cn("text-sm", t.done && "line-through text-muted-foreground")}>{t.title}</span>
                    </label>
                  ))}
                  {tasks.length === 0 && <div className="text-sm text-muted-foreground">No tasks</div>}
                </div>
              </CardContent>
            </Card>
          </section>

          {/* AI Assistant */}
          <section id="ai" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2"><Bot className="h-4 w-4" /> AI Assistant</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="border rounded-md p-3 h-64 overflow-auto bg-muted/20">
                  <div className="space-y-2">
                    {chatMessages.map((m, idx) => (
                      <div key={idx} className={cn("max-w-[80%] p-2 rounded-md", m.role === "therapist" ? "ml-auto bg-primary text-primary-foreground" : "mr-auto bg-accent")}>{m.content}</div>
                    ))}
                  </div>
                </div>
                <div className="flex gap-2 mt-3">
                  <Input value={chatInput} onChange={(e) => setChatInput(e.target.value)} placeholder="Ask for prep, summary, or resources" />
                  <Button onClick={handleChatSend}>Send</Button>
                </div>
              </CardContent>
            </Card>
          </section>

          {/* Settings (light) */}
          <section id="settings">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2"><Settings className="h-4 w-4" /> Settings</CardTitle>
              </CardHeader>
              <CardContent>
                <Tabs defaultValue="general">
                  <TabsList>
                    <TabsTrigger value="general">General</TabsTrigger>
                    <TabsTrigger value="notifications">Notifications</TabsTrigger>
                  </TabsList>
                  <TabsContent value="general" className="space-y-3 mt-3">
                    <div className="grid gap-2">
                      <Label>Display name</Label>
                      <Input defaultValue="Dr. Taylor" />
                    </div>
                    <div className="grid gap-2">
                      <Label>Contact email</Label>
                      <Input type="email" defaultValue="taylor@example.com" />
                    </div>
                  </TabsContent>
                  <TabsContent value="notifications" className="space-y-3 mt-3">
                    <label className="flex items-center gap-3">
                      <input type="checkbox" defaultChecked />
                      <span className="text-sm">Session reminders</span>
                    </label>
                    <label className="flex items-center gap-3">
                      <input type="checkbox" defaultChecked />
                      <span className="text-sm">Task due alerts</span>
                    </label>
                  </TabsContent>
                </Tabs>
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
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm text-muted-foreground flex items-center gap-2">{icon}{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
      </CardContent>
    </Card>
  );
}

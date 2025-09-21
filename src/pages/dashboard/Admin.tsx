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
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ChartContainer, ChartLegend, ChartLegendContent, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { Bar, BarChart, Line, LineChart as RLineChart, XAxis, YAxis } from "recharts";
import {
  Activity,
  BadgeDollarSign,
  Banknote,
  CheckCircle2,
  Home,
  Lock,
  ShieldCheck,
  UserCheck,
  Users,
  XCircle,
  FileWarning,
  FolderKanban,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface UserItem {
  id: string;
  name: string;
  email: string;
  role: "Therapist" | "Patient" | "Admin";
  status: "active" | "suspended" | "pending";
  licenseId?: string; // for therapists
}

interface RevenueItem {
  id: string;
  date: string; // YYYY-MM
  revenue: number;
}

interface AuditLogItem {
  id: string;
  at: string; // ISO
  actor: string;
  action: string;
}

const readLS = <T,>(key: string, fallback: T): T => {
  try {
    const v = localStorage.getItem(key);
    return v ? (JSON.parse(v) as T) : fallback;
  } catch {
    return fallback;
  }
};
const writeLS = (k: string, v: unknown) => { try { localStorage.setItem(k, JSON.stringify(v)); } catch {} };

const seedAdmin = () => {
  const users = readLS<UserItem[]>("theralink:admin:users", []);
  if (users.length === 0) {
    const seed: UserItem[] = [
      { id: "u1", name: "Dr. Taylor", email: "taylor@example.com", role: "Therapist", status: "active", licenseId: "LIC-55421" },
      { id: "u2", name: "Alex Johnson", email: "alex@example.com", role: "Patient", status: "active" },
      { id: "u3", name: "Priya Singh", email: "priya@example.com", role: "Patient", status: "active" },
      { id: "u4", name: "Dr. Chen", email: "chen@example.com", role: "Therapist", status: "pending", licenseId: "LIC-88310" },
      { id: "u5", name: "Morgan Admin", email: "admin@example.com", role: "Admin", status: "active" },
    ];
    writeLS("theralink:admin:users", seed);
  }
  const rev = readLS<RevenueItem[]>("theralink:admin:revenue", []);
  if (rev.length === 0) {
    const now = new Date();
    const ym = (d: Date) => `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}`;
    const months: RevenueItem[] = Array.from({ length: 6 }, (_, i) => {
      const d = new Date(now.getFullYear(), now.getMonth() - (5 - i), 1);
      return { id: `r${i}`, date: ym(d), revenue: 5000 + Math.round(Math.random() * 5000) };
    });
    writeLS("theralink:admin:revenue", months);
  }
  const logs = readLS<AuditLogItem[]>("theralink:admin:audit", []);
  if (logs.length === 0) {
    const seedLogs: AuditLogItem[] = [
      { id: "al1", at: new Date().toISOString(), actor: "admin@example.com", action: "Enabled audit logging" },
      { id: "al2", at: new Date().toISOString(), actor: "taylor@example.com", action: "Shared resource Mindfulness Basics PDF" },
    ];
    writeLS("theralink:admin:audit", seedLogs);
  }
};

export default function AdminDashboard() {
  const [users, setUsers] = useState<UserItem[]>([]);
  const [revenue, setRevenue] = useState<RevenueItem[]>([]);
  const [audit, setAudit] = useState<AuditLogItem[]>([]);
  const [newUser, setNewUser] = useState<{ name: string; email: string; role: UserItem["role"]; licenseId?: string }>({ name: "", email: "", role: "Patient", licenseId: "" });
  const [security, setSecurity] = useState({ auditLogging: true, twoFactor: true, dataProtection: true });

  useEffect(() => {
    seedAdmin();
    setUsers(readLS<UserItem[]>("theralink:admin:users", []));
    setRevenue(readLS<RevenueItem[]>("theralink:admin:revenue", []));
    setAudit(readLS<AuditLogItem[]>("theralink:admin:audit", []));
  }, []);

  const therapistsPending = useMemo(() => users.filter((u) => u.role === "Therapist" && u.status === "pending"), [users]);
  const activeUsers = useMemo(() => users.filter((u) => u.status === "active").length, [users]);

  const handleAddUser = () => {
    if (!newUser.name || !newUser.email) return;
    const item: UserItem = {
      id: `u${Date.now()}`,
      name: newUser.name,
      email: newUser.email,
      role: newUser.role,
      status: newUser.role === "Therapist" ? "pending" : "active",
      licenseId: newUser.role === "Therapist" ? newUser.licenseId : undefined,
    };
    const next = [item, ...users];
    setUsers(next);
    writeLS("theralink:admin:users", next);
    setNewUser({ name: "", email: "", role: "Patient", licenseId: "" });
  };

  const approveTherapist = (id: string) => {
    const next = users.map((u) => (u.id === id ? { ...u, status: "active" as const } : u));
    setUsers(next);
    writeLS("theralink:admin:users", next);
    const log: AuditLogItem = { id: `al${Date.now()}`, at: new Date().toISOString(), actor: "admin@example.com", action: `Approved therapist ${id}` };
    const nextAudit = [log, ...audit];
    setAudit(nextAudit);
    writeLS("theralink:admin:audit", nextAudit);
  };
  const rejectTherapist = (id: string) => {
    const next = users.map((u) => (u.id === id ? { ...u, status: "suspended" as const } : u));
    setUsers(next);
    writeLS("theralink:admin:users", next);
  };

  const roleCounts = useMemo(() => {
    return {
      Therapists: users.filter((u) => u.role === "Therapist").length,
      Patients: users.filter((u) => u.role === "Patient").length,
      Admins: users.filter((u) => u.role === "Admin").length,
    };
  }, [users]);

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
            <SidebarGroupLabel>Admin</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                <SidebarMenuItem>
                  <SidebarMenuButton asChild>
                    <a href="#overview"><Home /> <span>Overview</span></a>
                  </SidebarMenuButton>
                </SidebarMenuItem>
                <SidebarMenuItem>
                  <SidebarMenuButton asChild>
                    <a href="#users"><Users /> <span>Users</span></a>
                  </SidebarMenuButton>
                </SidebarMenuItem>
                <SidebarMenuItem>
                  <SidebarMenuButton asChild>
                    <a href="#verify"><UserCheck /> <span>Therapist Verification</span></a>
                  </SidebarMenuButton>
                </SidebarMenuItem>
                <SidebarMenuItem>
                  <SidebarMenuButton asChild>
                    <a href="#analytics"><Activity /> <span>Analytics</span></a>
                  </SidebarMenuButton>
                </SidebarMenuItem>
                <SidebarMenuItem>
                  <SidebarMenuButton asChild>
                    <a href="#finance"><Banknote /> <span>Finance</span></a>
                  </SidebarMenuButton>
                </SidebarMenuItem>
                <SidebarMenuItem>
                  <SidebarMenuButton asChild>
                    <a href="#content"><FolderKanban /> <span>Content Control</span></a>
                  </SidebarMenuButton>
                </SidebarMenuItem>
                <SidebarMenuItem>
                  <SidebarMenuButton asChild>
                    <a href="#security"><ShieldCheck /> <span>Security</span></a>
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
          <div className="font-semibold">Admin Dashboard</div>
        </div>
        <div className="p-4 space-y-8">
          {/* Overview */}
          <section id="overview" className="space-y-4">
            <div className="grid gap-4 grid-cols-1 md:grid-cols-4">
              <StatCard title="Active users" value={activeUsers} icon={<Users className="h-4 w-4" />} />
              <StatCard title="Pending therapists" value={therapistsPending.length} icon={<UserCheck className="h-4 w-4" />} />
              <StatCard title="Monthly revenue" value={`$${(revenue[revenue.length-1]?.revenue || 0).toLocaleString()}`} icon={<BadgeDollarSign className="h-4 w-4" />} />
              <StatCard title="Audit events" value={audit.length} icon={<Lock className="h-4 w-4" />} />
            </div>
          </section>

          {/* Users */}
          <section id="users" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Users</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-4 gap-3 mb-3">
                  <div className="grid gap-2"><Label>Name</Label><Input value={newUser.name} onChange={(e)=>setNewUser((s)=>({...s,name:e.target.value}))} /></div>
                  <div className="grid gap-2"><Label>Email</Label><Input type="email" value={newUser.email} onChange={(e)=>setNewUser((s)=>({...s,email:e.target.value}))} /></div>
                  <div className="grid gap-2"><Label>Role</Label>
                    <select className="h-10 rounded-md border px-3" value={newUser.role} onChange={(e)=>setNewUser((s)=>({...s,role:e.target.value as UserItem["role"]}))}>
                      <option>Patient</option>
                      <option>Therapist</option>
                      <option>Admin</option>
                    </select>
                  </div>
                  {newUser.role === "Therapist" && (
                    <div className="grid gap-2"><Label>License ID</Label><Input value={newUser.licenseId} onChange={(e)=>setNewUser((s)=>({...s,licenseId:e.target.value}))} /></div>
                  )}
                </div>
                <Button onClick={handleAddUser}>Add user</Button>

                <div className="mt-4">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Name</TableHead>
                        <TableHead>Email</TableHead>
                        <TableHead>Role</TableHead>
                        <TableHead>Status</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {users.map((u) => (
                        <TableRow key={u.id}>
                          <TableCell>{u.name}</TableCell>
                          <TableCell>{u.email}</TableCell>
                          <TableCell>{u.role}</TableCell>
                          <TableCell>
                            <span className={cn("px-2 py-1 rounded text-xs", u.status === 'active' && 'bg-green-100 text-green-700', u.status === 'pending' && 'bg-yellow-100 text-yellow-800', u.status === 'suspended' && 'bg-red-100 text-red-700')}>{u.status}</span>
                          </TableCell>
                        </TableRow>
                      ))}
                      {users.length === 0 && (
                        <TableRow>
                          <TableCell colSpan={4} className="text-center text-muted-foreground">No users</TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          </section>

          {/* Verification */}
          <section id="verify" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Therapist verification</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {therapistsPending.map((t) => (
                    <div key={t.id} className="p-3 border rounded-md flex items-center justify-between">
                      <div>
                        <div className="font-medium">{t.name}</div>
                        <div className="text-xs text-muted-foreground">License {t.licenseId}</div>
                      </div>
                      <div className="flex gap-2">
                        <Button size="sm" className="bg-green-600 hover:bg-green-700" onClick={() => approveTherapist(t.id)}><CheckCircle2 className="h-4 w-4 mr-1" /> Approve</Button>
                        <Button size="sm" variant="destructive" onClick={() => rejectTherapist(t.id)}><XCircle className="h-4 w-4 mr-1" /> Reject</Button>
                      </div>
                    </div>
                  ))}
                  {therapistsPending.length === 0 && <div className="text-sm text-muted-foreground">No pending verifications</div>}
                </div>
              </CardContent>
            </Card>
          </section>

          {/* Analytics */}
          <section id="analytics" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Platform analytics</CardTitle>
              </CardHeader>
              <CardContent>
                <Tabs defaultValue="usage">
                  <TabsList>
                    <TabsTrigger value="usage">Usage</TabsTrigger>
                    <TabsTrigger value="engagement">Engagement</TabsTrigger>
                  </TabsList>
                  <TabsContent value="usage" className="mt-4">
                    <ChartContainer
                      config={{ usage: { label: "Sessions", color: "hsl(var(--primary))" } }}
                      className="w-full h-64"
                    >
                      <BarChart data={revenue.map((r, i)=>({ label: r.date, usage: 100 + i*20 }))}>
                        <XAxis dataKey="label" tickLine={false} axisLine={false} />
                        <YAxis tickLine={false} axisLine={false} />
                        <ChartTooltip content={<ChartTooltipContent />} />
                        <Bar dataKey="usage" fill="var(--color-usage)" radius={4} />
                      </BarChart>
                    </ChartContainer>
                  </TabsContent>
                  <TabsContent value="engagement" className="mt-4">
                    <ChartContainer
                      config={{ avg: { label: "Avg Session Length", color: "hsl(var(--secondary))" } }}
                      className="w-full h-64"
                    >
                      <RLineChart data={revenue.map((r)=>({ label: r.date, avg: 40 + Math.round(Math.random()*20) }))}>
                        <XAxis dataKey="label" tickLine={false} axisLine={false} />
                        <YAxis tickLine={false} axisLine={false} />
                        <ChartTooltip content={<ChartTooltipContent />} />
                        <Line type="monotone" dataKey="avg" stroke="var(--color-avg)" strokeWidth={2} dot={false} />
                      </RLineChart>
                    </ChartContainer>
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>
          </section>

          {/* Finance */}
          <section id="finance" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Financial management</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4 grid-cols-1 md:grid-cols-3">
                  <StatCard title="This month" value={`$${(revenue[revenue.length-1]?.revenue || 0).toLocaleString()}`} icon={<BadgeDollarSign className="h-4 w-4" />} />
                  <StatCard title="Last month" value={`$${(revenue[revenue.length-2]?.revenue || 0).toLocaleString()}`} icon={<BadgeDollarSign className="h-4 w-4" />} />
                  <StatCard title="Total (6 mo)" value={`$${revenue.reduce((a,b)=>a+b.revenue,0).toLocaleString()}`} icon={<Banknote className="h-4 w-4" />} />
                </div>
                <div className="mt-4">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Month</TableHead>
                        <TableHead>Revenue</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {revenue.map((r) => (
                        <TableRow key={r.id}>
                          <TableCell>{r.date}</TableCell>
                          <TableCell>${r.revenue.toLocaleString()}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          </section>

          {/* Content Control */}
          <section id="content" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Content management</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">Manage shared resources and flagged items.</p>
                <div className="mt-3 space-y-2">
                  {(readLS<any[]>("theralink:resources", [])).map((r) => (
                    <div key={r.id} className="p-3 border rounded-md flex items-center justify-between">
                      <div>
                        <div className="font-medium">{r.title}</div>
                        <div className="text-xs text-muted-foreground">{String(r.type).toUpperCase()}</div>
                      </div>
                      <div className="flex gap-2 items-center">
                        <Button asChild size="sm" variant="outline"><a href={r.url} target="_blank">Open</a></Button>
                        <Button size="sm" variant="destructive">Remove</Button>
                      </div>
                    </div>
                  ))}
                  {readLS<any[]>("theralink:resources", []).length === 0 && <div className="text-sm text-muted-foreground">No resources</div>}
                </div>
              </CardContent>
            </Card>
          </section>

          {/* Security */}
          <section id="security" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Security & compliance</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <label className="flex items-center gap-3"><input type="checkbox" checked={security.auditLogging} onChange={(e)=>setSecurity((s)=>({ ...s, auditLogging: e.target.checked }))} /><span>Audit logging</span></label>
                  <label className="flex items-center gap-3"><input type="checkbox" checked={security.twoFactor} onChange={(e)=>setSecurity((s)=>({ ...s, twoFactor: e.target.checked }))} /><span>Enforce two-factor authentication</span></label>
                  <label className="flex items-center gap-3"><input type="checkbox" checked={security.dataProtection} onChange={(e)=>setSecurity((s)=>({ ...s, dataProtection: e.target.checked }))} /><span>Data protection mode (HIPAA/GDPR)</span></label>
                </div>
                <div className="mt-4">
                  <div className="font-medium mb-2">Audit log</div>
                  <div className="space-y-2 max-h-60 overflow-auto">
                    {audit.map((a) => (
                      <div key={a.id} className="p-2 border rounded-md text-sm">
                        <div className="text-xs text-muted-foreground">{new Date(a.at).toLocaleString()} • {a.actor}</div>
                        <div>{a.action}</div>
                      </div>
                    ))}
                    {audit.length === 0 && <div className="text-sm text-muted-foreground">No audit entries</div>}
                  </div>
                </div>
                <div className="mt-4">
                  <div className="font-medium mb-2">Access control</div>
                  <div className="grid md:grid-cols-3 gap-3">
                    {Object.entries(roleCounts).map(([k,v]) => (
                      <Card key={k}>
                        <CardHeader className="pb-2"><CardTitle className="text-sm text-muted-foreground">{k}</CardTitle></CardHeader>
                        <CardContent><div className="text-2xl font-bold">{v}</div></CardContent>
                      </Card>
                    ))}
                  </div>
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

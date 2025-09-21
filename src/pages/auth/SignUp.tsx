import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";

type Role = "Therapist" | "Patient" | "Admin";

type User = { id: string; name: string; email: string; role: Role; status: "active" | "suspended" | "pending"; licenseId?: string };

const readLS = <T,>(k: string, f: T): T => { try{ const v = localStorage.getItem(k); return v? JSON.parse(v) as T : f; }catch{ return f; } };
const writeLS = (k: string, v: unknown) => { try{ localStorage.setItem(k, JSON.stringify(v)); }catch{} };

export default function SignUp() {
  const nav = useNavigate();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<Role>("Patient");
  const [licenseId, setLicenseId] = useState("");
  const [error, setError] = useState("");

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email || !password) { setError("All fields are required"); return; }
    const users = readLS<User[]>("theralink:admin:users", []);
    if (users.some((u)=>u.email.toLowerCase()===email.toLowerCase())) { setError("Email already exists"); return; }
    const status: User["status"] = role === "Therapist" ? "pending" : "active";
    const user: User = { id: `u${Date.now()}`, name, email, role, status, licenseId: role === "Therapist" ? licenseId : undefined };
    const next = [user, ...users];
    writeLS("theralink:admin:users", next);
    writeLS("theralink:auth:user", user);
    if (role === "Patient") return nav("/dashboard/patient");
    if (role === "Admin") return nav("/dashboard/admin");
    if (role === "Therapist") return nav("/dashboard/therapist");
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Create your account</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={onSubmit} className="space-y-4">
            <div className="grid gap-2"><Label>Full name</Label><Input value={name} onChange={(e)=>setName(e.target.value)} required /></div>
            <div className="grid gap-2"><Label>Email</Label><Input type="email" value={email} onChange={(e)=>setEmail(e.target.value)} required /></div>
            <div className="grid gap-2"><Label>Password</Label><Input type="password" value={password} onChange={(e)=>setPassword(e.target.value)} required /></div>
            <div className="grid gap-2">
              <Label>Role</Label>
              <select className="h-10 rounded-md border px-3" value={role} onChange={(e)=>setRole(e.target.value as Role)}>
                <option>Patient</option>
                <option>Therapist</option>
                <option>Admin</option>
              </select>
            </div>
            {role === "Therapist" && (
              <div className="grid gap-2"><Label>License ID (required for verification)</Label><Input value={licenseId} onChange={(e)=>setLicenseId(e.target.value)} required /></div>
            )}
            {error && <div className="text-sm text-red-600">{error}</div>}
            <Button type="submit" className="w-full">Create Account</Button>
            <Button type="button" variant="outline" className="w-full" onClick={()=>nav('/signin')}>Sign in</Button>
            <Button type="button" variant="ghost" className="w-full" onClick={()=>nav('/')}>Back to Home</Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}

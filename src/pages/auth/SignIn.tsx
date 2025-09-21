import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";

type Role = "Therapist" | "Patient" | "Admin";

type User = { id: string; name: string; email: string; role: Role; status: "active" | "suspended" | "pending"; licenseId?: string };

const readLS = <T,>(k: string, f: T): T => { try{ const v = localStorage.getItem(k); return v? JSON.parse(v) as T : f; }catch{ return f; } };
const writeLS = (k: string, v: unknown) => { try{ localStorage.setItem(k, JSON.stringify(v)); }catch{} };

export default function SignIn() {
  const nav = useNavigate();
  const [email, setEmail] = useState("");
  const [role, setRole] = useState<Role>("Patient");
  const [error, setError] = useState("");

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const users = readLS<User[]>("theralink:admin:users", []);
    const user = users.find((u) => u.email.toLowerCase() === email.toLowerCase() && u.role === role);
    if (!user) { setError("User not found. Please sign up."); return; }
    writeLS("theralink:auth:user", user);
    if (role === "Patient") return nav("/dashboard/patient");
    if (role === "Admin") return nav("/dashboard/admin");
    if (role === "Therapist") {
      if (user.status !== "active") return nav("/dashboard/therapist");
      return nav("/dashboard/therapist");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Sign In</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={onSubmit} className="space-y-4">
            <div className="grid gap-2">
              <Label>Email</Label>
              <Input type="email" value={email} onChange={(e)=>setEmail(e.target.value)} required />
            </div>
            <div className="grid gap-2">
              <Label>Role</Label>
              <select className="h-10 rounded-md border px-3" value={role} onChange={(e)=>setRole(e.target.value as Role)}>
                <option>Patient</option>
                <option>Therapist</option>
                <option>Admin</option>
              </select>
            </div>
            {error && <div className="text-sm text-red-600">{error}</div>}
            <Button type="submit" className="w-full">Continue</Button>
            <Button type="button" variant="outline" className="w-full" onClick={()=>nav('/signup')}>Create an account</Button>
            <Button type="button" variant="ghost" className="w-full" onClick={()=>nav('/')}>Back to Home</Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}

import { Button } from "@/components/ui/button";
import { useParams } from "react-router-dom";

export default function SessionPage() {
  const { id } = useParams();
  return (
    <div className="min-h-screen p-6 flex flex-col items-center justify-center gap-4 bg-background">
      <div className="text-2xl font-semibold">Session Room</div>
      <div className="text-sm text-muted-foreground">Session ID: {id}</div>
      <div className="w-full max-w-xl h-64 border rounded-md flex items-center justify-center bg-muted/20">Video area</div>
      <div className="w-full max-w-xl grid grid-cols-2 gap-2">
        <Button variant="outline" asChild><a href="/dashboard/patient">Back to Dashboard</a></Button>
        <Button className="bg-green-600 hover:bg-green-700">Ready</Button>
      </div>
    </div>
  );
}

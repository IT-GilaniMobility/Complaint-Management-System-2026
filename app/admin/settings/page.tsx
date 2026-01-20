"use client";

import { useState } from "react";
import { BellRing, Save } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { toast } from "@/components/ui/use-toast";

export default function AdminSettingsPage() {
  const [sla, setSla] = useState({ Urgent: 3, High: 5, Medium: 7, Low: 10 });
  const [notifications, setNotifications] = useState({ email: true, sms: false, slack: true });

  const handleSave = () => {
    toast({ title: "Settings saved", description: "Values stored locally for demo" });
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-semibold text-primary">Admin</p>
          <h1 className="text-2xl font-bold">Settings</h1>
          <p className="text-sm text-muted-foreground">SLA defaults and notifications.</p>
        </div>
        <Button onClick={handleSave}>
          <Save className="mr-2 h-4 w-4" /> Save changes
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>SLA defaults</CardTitle>
          <CardDescription>Define target resolution in days by priority.</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {Object.entries(sla).map(([key, value]) => (
            <div key={key} className="space-y-2">
              <Label>{key}</Label>
              <Input
                type="number"
                min={1}
                value={value}
                onChange={(e) => setSla((prev) => ({ ...prev, [key]: Number(e.target.value) }))}
              />
              <p className="text-xs text-muted-foreground">Days to resolve</p>
            </div>
          ))}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Notifications</CardTitle>
          <CardDescription>Control automated alerts.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {[
            { key: "email", label: "Email alerts" },
            { key: "sms", label: "SMS alerts" },
            { key: "slack", label: "Slack channel" },
          ].map((item) => (
            <div key={item.key} className="flex items-center justify-between rounded-lg border p-3">
              <div className="flex items-center gap-2">
                <BellRing className="h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="text-sm font-medium">{item.label}</p>
                  <p className="text-xs text-muted-foreground">UI state only</p>
                </div>
              </div>
              <Switch
                checked={notifications[item.key as keyof typeof notifications]}
                onCheckedChange={(checked: boolean) =>
                  setNotifications((prev) => ({ ...prev, [item.key]: checked }))
                }
              />
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}

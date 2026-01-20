"use client";

import { useEffect, useState } from "react";
import { Bell, RefreshCw } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { getRecentActivities, getRecentComplaints } from "@/app/actions/complaints";

export function NotificationsWidget() {
  const [recentActivities, setRecentActivities] = useState<any[]>([]);
  const [recentNewComplaints, setRecentNewComplaints] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [lastRefresh, setLastRefresh] = useState<Date | null>(null);

  const refreshNotifications = async () => {
    setLoading(true);
    try {
      const activities = await getRecentActivities(3);
      const complaints = await getRecentComplaints(5, 60);
      setRecentActivities(activities);
      setRecentNewComplaints(complaints);
      setLastRefresh(new Date());
    } catch (err) {
      console.error("Failed to refresh notifications:", err);
    } finally {
      setLoading(false);
    }
  };

  // Initial load
  useEffect(() => {
    refreshNotifications();
  }, []);

  // Auto-refresh every 30 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      refreshNotifications();
    }, 30000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <Bell className="h-5 w-5" />
          <h2 className="text-lg font-semibold">Recent Updates</h2>
        </div>
        <Button
          variant="ghost"
          size="icon"
          onClick={refreshNotifications}
          disabled={loading}
          title="Refresh notifications"
        >
          <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
        </Button>
      </div>

      <div className="grid gap-3 md:grid-cols-2">
        {/* New Complaints */}
        {recentNewComplaints.length > 0 && (
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">🆕 New Complaints</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {recentNewComplaints.slice(0, 3).map((complaint: any) => (
                <div key={complaint.id} className="flex items-start gap-2 text-sm">
                  <span className="text-lg">📋</span>
                  <div>
                    <p className="font-medium">{complaint.complaint_number}</p>
                    <p className="text-xs text-muted-foreground line-clamp-1">{complaint.subject}</p>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        )}

        {/* Recent Activities */}
        {recentActivities.length > 0 && (
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">⚡ Recent Activity</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {recentActivities.slice(0, 3).map((activity: any) => {
                const icon = activity.action === "status_change" ? "🔄" : activity.action === "assignment_change" ? "👤" : "📝";
                return (
                  <div key={activity.id} className="flex items-start gap-2 text-sm">
                    <span className="text-lg">{icon}</span>
                    <div>
                      <p className="font-medium">{activity.complaint?.complaint_number}</p>
                      <p className="text-xs text-muted-foreground">
                        {activity.action === "status_change" && "Status updated"}
                        {activity.action === "assignment_change" && "Assignment changed"}
                        {activity.action === "comment" && "New comment"}
                      </p>
                    </div>
                  </div>
                );
              })}
            </CardContent>
          </Card>
        )}

        {/* Empty state */}
        {recentActivities.length === 0 && recentNewComplaints.length === 0 && (
          <Card className="md:col-span-2">
            <CardContent className="py-8 text-center text-sm text-muted-foreground">
              No recent activities or new complaints yet.
            </CardContent>
          </Card>
        )}
      </div>

      {lastRefresh && (
        <p className="text-xs text-muted-foreground text-right">
          Last updated: {lastRefresh.toLocaleTimeString()}
        </p>
      )}
    </div>
  );
}

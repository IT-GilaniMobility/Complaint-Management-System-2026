"use client";

import { seedCategories } from "@/app/actions/seed";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useEffect, useState } from "react";

export default function AdminSeedPage() {
  const [status, setStatus] = useState<string>("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const runSeed = async () => {
      try {
        const result = await seedCategories();
        if (result.success) {
          setStatus(`✓ Seeded ${result.count} categories successfully!`);
        } else {
          setStatus(`✗ Error: ${result.error}`);
        }
      } catch (err: any) {
        setStatus(`✗ Error: ${err.message}`);
      } finally {
        setLoading(false);
      }
    };

    runSeed();
  }, []);

  return (
    <div className="mx-auto max-w-md space-y-6 py-12">
      <Card>
        <CardHeader>
          <CardTitle>Database Seeding</CardTitle>
          <CardDescription>Initialize reference data</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm">{loading ? "Seeding..." : status}</p>
          {!loading && (
            <Button onClick={() => window.location.reload()}>
              Done
            </Button>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

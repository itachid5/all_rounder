"use client";

import { PageHeader } from "@/components/shared/page-header";
import { Card, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, Filter, Download } from "lucide-react";

const activities = [
  { id: 1, action: "User Login", user: "John Doe", ip: "192.168.1.105", date: "2026-07-27 10:30 AM", type: "Security" },
  { id: 2, action: "Updated Profile", user: "John Doe", ip: "192.168.1.105", date: "2026-07-27 11:15 AM", type: "User" },
  { id: 3, action: "Enabled Module: Inventory", user: "Admin", ip: "10.0.0.5", date: "2026-07-26 09:00 AM", type: "System" },
  { id: 4, action: "Failed Login Attempt", user: "Unknown", ip: "203.0.113.42", date: "2026-07-25 08:45 PM", type: "Security" },
  { id: 5, action: "Created New Role", user: "Jane Smith", ip: "192.168.1.110", date: "2026-07-25 02:20 PM", type: "System" },
];

export default function ActivityPage() {
  return (
    <div className="space-y-6">
      <PageHeader 
        title="Business Activity" 
        description="View and monitor recent activities, user actions, and security events."
        actions={
          <Button variant="outline">
            <Download className="mr-2 h-4 w-4" />
            Export Log
          </Button>
        }
      />

      <Card>
        <div className="p-4 border-b flex flex-col sm:flex-row gap-4 items-center justify-between">
          <div className="relative w-full sm:max-w-sm">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search activities..."
              className="pl-8"
            />
          </div>
          <Button variant="outline" className="w-full sm:w-auto">
            <Filter className="mr-2 h-4 w-4" />
            Filters
          </Button>
        </div>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Action</TableHead>
                <TableHead>User</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>IP Address</TableHead>
                <TableHead>Date &amp; Time</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {activities.map((activity) => (
                <TableRow key={activity.id}>
                  <TableCell className="font-medium">{activity.action}</TableCell>
                  <TableCell>{activity.user}</TableCell>
                  <TableCell>
                    <Badge variant={activity.type === "Security" ? "destructive" : "secondary"}>
                      {activity.type}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-muted-foreground">{activity.ip}</TableCell>
                  <TableCell className="text-muted-foreground">{activity.date}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}

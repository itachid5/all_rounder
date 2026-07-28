"use client";

import { PageHeader } from "@/shared/components/page-header";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/shared/components/card";
import { Button } from "@/shared/components/button";
import { Input } from "@/shared/components/input";
import { Label } from "@/shared/components/label";
import { Avatar, AvatarFallback, AvatarImage } from "@/shared/components/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/shared/components/tabs";
import { Separator } from "@/shared/components/separator";
import { Switch } from "@/shared/components/switch";
import { Camera } from "lucide-react";

export default function ProfilePage() {
  return (
    <div className="space-y-6">
      <PageHeader 
        title="User Profile" 
        description="Manage your personal information, security settings, and preferences."
      />

      <Tabs defaultValue="general" className="space-y-4">
        <TabsList>
          <TabsTrigger value="general">General</TabsTrigger>
          <TabsTrigger value="security">Security</TabsTrigger>
          <TabsTrigger value="preferences">Preferences</TabsTrigger>
        </TabsList>
        
        <TabsContent value="general" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Profile Information</CardTitle>
              <CardDescription>Update your personal details here.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center gap-6">
                <Avatar className="h-24 w-24">
                  <AvatarImage src="" />
                  <AvatarFallback className="text-3xl font-semibold">JD</AvatarFallback>
                </Avatar>
                <Button variant="outline">
                  <Camera className="mr-2 h-4 w-4" />
                  Change Avatar
                </Button>
              </div>
              <Separator />
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="firstName">First Name</Label>
                  <Input id="firstName" defaultValue="John" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="lastName">Last Name</Label>
                  <Input id="lastName" defaultValue="Doe" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email Address</Label>
                  <Input id="email" type="email" defaultValue="john.doe@example.com" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone">Phone Number</Label>
                  <Input id="phone" type="tel" defaultValue="+1 (555) 000-0000" />
                </div>
              </div>
            </CardContent>
            <CardFooter>
              <Button>Save Changes</Button>
            </CardFooter>
          </Card>
        </TabsContent>

        <TabsContent value="security" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Update Password</CardTitle>
              <CardDescription>Ensure your account is using a long, random password to stay secure.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="currentPassword">Current Password</Label>
                <Input id="currentPassword" type="password" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="newPassword">New Password</Label>
                <Input id="newPassword" type="password" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Confirm New Password</Label>
                <Input id="confirmPassword" type="password" />
              </div>
            </CardContent>
            <CardFooter>
              <Button>Update Password</Button>
            </CardFooter>
          </Card>
        </TabsContent>

        <TabsContent value="preferences" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Email Notifications</CardTitle>
              <CardDescription>Choose what updates you want to receive via email.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between rounded-lg border p-4">
                <div className="space-y-0.5">
                  <Label className="text-base">Marketing emails</Label>
                  <p className="text-sm text-muted-foreground">Receive emails about new products, features, and more.</p>
                </div>
                <Switch defaultChecked />
              </div>
              <div className="flex items-center justify-between rounded-lg border p-4">
                <div className="space-y-0.5">
                  <Label className="text-base">Security emails</Label>
                  <p className="text-sm text-muted-foreground">Receive emails about your account security.</p>
                </div>
                <Switch defaultChecked disabled />
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

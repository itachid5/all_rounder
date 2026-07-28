"use client";

import { PageHeader } from "@/components/shared/page-header";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Select } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Building2, Globe, Clock, Save } from "lucide-react";

export default function SettingsPage() {
  return (
    <div className="p-6 max-w-5xl mx-auto">
      <PageHeader
        title="Business Settings"
        description="Manage your business profile, preferences, and regional settings."
      />
      
      <Tabs defaultValue="profile" className="mt-6">
        <TabsList className="mb-8">
          <TabsTrigger value="profile">Profile & Branding</TabsTrigger>
          <TabsTrigger value="regional">Regional Settings</TabsTrigger>
          <TabsTrigger value="preferences">Preferences</TabsTrigger>
        </TabsList>
        
        <TabsContent value="profile" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Building2 className="w-5 h-5" />
                Business Profile
              </CardTitle>
              <CardDescription>Update your company details and logo.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center gap-6">
                <div className="w-24 h-24 rounded-lg bg-muted border-2 border-dashed flex items-center justify-center text-muted-foreground">
                  Logo
                </div>
                <div>
                  <Button variant="outline" size="sm" className="mb-2">Upload Logo</Button>
                  <p className="text-xs text-muted-foreground">Recommended size: 256x256px. Max 2MB.</p>
                </div>
              </div>
              
              <Separator />
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="businessName">Business Name</Label>
                  <Input id="businessName" defaultValue="Acme Corp" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="industry">Industry</Label>
                  <Select id="industry" defaultValue="software">
                    <option value="software">Software & IT</option>
                    <option value="retail">Retail</option>
                    <option value="manufacturing">Manufacturing</option>
                  </Select>
                </div>
                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="address">Address</Label>
                  <Input id="address" defaultValue="123 Innovation Drive, Tech City, TC 10101" />
                </div>
              </div>
            </CardContent>
            <CardFooter className="bg-muted/50 justify-end border-t mt-6">
              <Button>
                <Save className="w-4 h-4 mr-2" />
                Save Changes
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>
        
        <TabsContent value="regional" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Globe className="w-5 h-5" />
                Regional & Currency
              </CardTitle>
              <CardDescription>Set your timezone, language, and primary currency.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="timezone">Timezone</Label>
                  <Select id="timezone" defaultValue="utc">
                    <option value="utc">UTC (Coordinated Universal Time)</option>
                    <option value="est">EST (Eastern Standard Time)</option>
                    <option value="pst">PST (Pacific Standard Time)</option>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="language">Language</Label>
                  <Select id="language" defaultValue="en">
                    <option value="en">English (US)</option>
                    <option value="es">Español</option>
                    <option value="fr">Français</option>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="currency">Primary Currency</Label>
                  <Select id="currency" defaultValue="usd">
                    <option value="usd">USD ($)</option>
                    <option value="eur">EUR (€)</option>
                    <option value="gbp">GBP (£)</option>
                  </Select>
                </div>
              </div>
            </CardContent>
            <CardFooter className="bg-muted/50 justify-end border-t mt-6">
              <Button>
                <Save className="w-4 h-4 mr-2" />
                Save Changes
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>

        <TabsContent value="preferences" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="w-5 h-5" />
                Business Preferences
              </CardTitle>
              <CardDescription>Configure working hours and operational defaults.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="workingDays">Working Days</Label>
                  <Select id="workingDays" defaultValue="mon-fri">
                    <option value="mon-fri">Monday - Friday</option>
                    <option value="mon-sat">Monday - Saturday</option>
                    <option value="all">24/7</option>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="invoicePrefix">Invoice Prefix</Label>
                  <Input id="invoicePrefix" defaultValue="INV-" />
                </div>
              </div>
            </CardContent>
            <CardFooter className="bg-muted/50 justify-end border-t mt-6">
              <Button>
                <Save className="w-4 h-4 mr-2" />
                Save Changes
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

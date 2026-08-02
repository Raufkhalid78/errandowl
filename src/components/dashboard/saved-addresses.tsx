"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, MapPin, Plus, Trash2, Star } from "lucide-react";
import { toast } from "sonner";

export function SavedAddresses({ profileId }: { profileId: string }) {
  const supabase = createClient();
  const [addresses, setAddresses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAdding, setIsAdding] = useState(false);
  const [newLabel, setNewLabel] = useState("");
  const [newAddress, setNewAddress] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchAddresses();
  }, [profileId]);

  const fetchAddresses = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("saved_addresses")
      .select("*")
      .eq("profile_id", profileId)
      .order("created_at", { ascending: false });

    if (!error && data) {
      setAddresses(data);
    }
    setLoading(false);
  };

  const handleAddAddress = async () => {
    if (!newLabel.trim() || !newAddress.trim()) {
      toast.error("Please provide both a label and an address.");
      return;
    }

    setSaving(true);
    const { data, error } = await supabase
      .from("saved_addresses")
      .insert({
        profile_id: profileId,
        label: newLabel.trim(),
        address: newAddress.trim(),
        is_default: addresses.length === 0 // Make first address default
      })
      .select()
      .single();

    if (error) {
      toast.error("Failed to add address: " + error.message);
    } else if (data) {
      toast.success("Address added successfully!");
      setAddresses([data, ...addresses]);
      setIsAdding(false);
      setNewLabel("");
      setNewAddress("");
    }
    setSaving(false);
  };

  const handleDeleteAddress = async (id: string) => {
    const { error } = await supabase.from("saved_addresses").delete().eq("id", id);
    if (error) {
      toast.error("Failed to delete address: " + error.message);
    } else {
      toast.success("Address deleted.");
      setAddresses(addresses.filter(a => a.id !== id));
    }
  };

  const handleSetDefault = async (id: string) => {
    // Optimistic UI update
    const previous = [...addresses];
    setAddresses(addresses.map(a => ({ ...a, is_default: a.id === id })));
    
    // Set all to non-default first
    await supabase.from("saved_addresses").update({ is_default: false }).eq("profile_id", profileId);
    
    // Set target to default
    const { error } = await supabase.from("saved_addresses").update({ is_default: true }).eq("id", id);
    if (error) {
      toast.error("Failed to set default: " + error.message);
      setAddresses(previous); // Revert on failure
    }
  };

  if (loading) {
    return <div className="flex justify-center p-8"><Loader2 className="animate-spin h-6 w-6 text-owl-violet" /></div>;
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle>Saved Addresses</CardTitle>
          <CardDescription>Manage your saved addresses for quick booking.</CardDescription>
        </div>
        {!isAdding && (
          <Button onClick={() => setIsAdding(true)} size="sm" className="gap-1">
            <Plus className="h-4 w-4" /> Add Address
          </Button>
        )}
      </CardHeader>
      <CardContent className="space-y-4">
        {isAdding && (
          <div className="p-4 border rounded-xl bg-muted/20 space-y-4 mb-4">
            <div className="space-y-2">
              <Label>Label (e.g. Home, Work)</Label>
              <Input 
                value={newLabel} 
                onChange={e => setNewLabel(e.target.value)} 
                placeholder="Home" 
                disabled={saving}
              />
            </div>
            <div className="space-y-2">
              <Label>Address</Label>
              <Input 
                value={newAddress} 
                onChange={e => setNewAddress(e.target.value)} 
                placeholder="123 Main St, Lahore" 
                disabled={saving}
              />
            </div>
            <div className="flex gap-2">
              <Button onClick={handleAddAddress} disabled={saving} className="flex-1 bg-owl-violet hover:bg-owl-violet/90 text-white">
                {saving ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                Save Address
              </Button>
              <Button onClick={() => setIsAdding(false)} disabled={saving} variant="outline" className="flex-1">
                Cancel
              </Button>
            </div>
          </div>
        )}

        {addresses.length === 0 && !isAdding ? (
          <div className="text-center py-8 text-muted-foreground flex flex-col items-center">
            <MapPin className="h-8 w-8 mb-2 opacity-20" />
            <p className="text-sm">No saved addresses yet.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {addresses.map((address) => (
              <div key={address.id} className={`p-4 border rounded-xl flex items-center justify-between gap-4 transition-colors ${address.is_default ? 'border-owl-violet/50 bg-owl-violet/5' : 'bg-card'}`}>
                <div className="flex items-start gap-3">
                  <div className={`mt-0.5 w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${address.is_default ? 'bg-owl-violet text-white' : 'bg-muted text-muted-foreground'}`}>
                    <MapPin className="h-4 w-4" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="font-semibold text-sm">{address.label}</h4>
                      {address.is_default && (
                         <span className="text-[10px] uppercase font-bold bg-owl-violet/10 text-owl-violet px-2 py-0.5 rounded-full flex items-center gap-1">
                            <Star className="h-2.5 w-2.5 fill-current" /> Default
                         </span>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground">{address.address}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {!address.is_default && (
                    <Button variant="ghost" size="sm" onClick={() => handleSetDefault(address.id)} className="text-xs h-8">
                      Set Default
                    </Button>
                  )}
                  <Button variant="ghost" size="icon" onClick={() => handleDeleteAddress(address.id)} className="h-8 w-8 text-destructive hover:bg-destructive/10 hover:text-destructive">
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

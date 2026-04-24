"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { createClient } from "@/lib/supabase/client"
import { toast } from "sonner"
import { UploadCloud, CheckCircle } from "lucide-react"
import { useTranslations } from "next-intl"

export function OnboardingWizard({ 
  profile, 
  user 
}: { 
  profile: any, 
  user: any 
}) {
  const [step, setStep] = React.useState(1)
  const [isLoading, setIsLoading] = React.useState(false)
  const router = useRouter()
  const supabase = createClient()
  
  // Try to load auth translation namespace, fallback if not existing yet
  // We'll create translations shortly
  const isTasker = profile?.role === 'tasker'
  const totalSteps = isTasker ? 2 : 1

  const [formData, setFormData] = React.useState({
    phone: profile?.phone || "",
    location: profile?.location || "",
    bio: profile?.bio || "",
  })

  const [cnicFrontFile, setCnicFrontFile] = React.useState<File | null>(null)
  const [cnicBackFile, setCnicBackFile] = React.useState<File | null>(null)

  const uploadDocument = async (file: File, side: 'front' | 'back') => {
    const fileExt = file.name.split('.').pop()
    const fileName = `cnic_${side}_${Math.random()}.${fileExt}`
    const filePath = `${user.id}/${fileName}`

    const { error: uploadError } = await supabase.storage
      .from('documents')
      .upload(filePath, file)

    if (uploadError) throw uploadError

    const { data: { publicUrl } } = supabase.storage
      .from('documents')
      .getPublicUrl(filePath)

    return publicUrl
  }

  const handleNext = async () => {
    if (step === 1) {
      if (!formData.phone || !formData.location) {
        toast.error("Please fill in required fields")
        return
      }
      
      if (isTasker) {
        setStep(2)
      } else {
        await completeOnboarding()
      }
    } else if (step === 2) {
      if (!cnicFrontFile || !cnicBackFile) {
        toast.error("Please upload both sides of your CNIC")
        return
      }
      await completeOnboarding()
    }
  }

  const completeOnboarding = async () => {
    setIsLoading(true)
    try {
      let frontUrl = profile?.cnic_url
      let backUrl = profile?.cnic_back_url

      if (isTasker && cnicFrontFile && cnicBackFile) {
        frontUrl = await uploadDocument(cnicFrontFile, 'front')
        backUrl = await uploadDocument(cnicBackFile, 'back')
      }

      const updates = {
        auth_id: user.id,
        phone: formData.phone,
        location: formData.location,
        bio: formData.bio,
        ...(isTasker && frontUrl && backUrl ? {
          cnic_url: frontUrl,
          cnic_back_url: backUrl,
          cnic_status: 'pending' // trigger review
        } : {}),
        updated_at: new Date()
      }

      const { error } = await supabase
        .from('profiles')
        .upsert(updates, { onConflict: 'auth_id' })

      if (error) throw error

      // If user is a tasker, ensure their tasker_profile exists so they appear in search
      if (isTasker && profile?.id) {
        const { error: taskerError } = await supabase
          .from('tasker_profiles')
          .upsert({
            profile_id: profile.id,
            city: formData.location,
            active: true,
            hourly_rate: 1000, // default rate
            categories: []
          }, { onConflict: 'profile_id' })
          
        if (taskerError) {
          console.error("Tasker profile creation error:", taskerError)
          // We don't throw here to not block the user, but we log it
        }
      }

      toast.success("Profile completed successfully!")
      router.push("/dashboard")
      router.refresh()
    } catch (err: any) {
      toast.error(err.message || "An error occurred")
      setIsLoading(false)
    }
  }

  return (
    <div className="max-w-xl mx-auto w-full bg-card p-6 md:p-8 rounded-2xl shadow-sm border">
      <div className="mb-8">
        <h2 className="text-2xl font-bold tracking-tight">Complete your profile</h2>
        <p className="text-muted-foreground mt-2">
          Step {step} of {totalSteps}: {step === 1 ? "Basic Information" : "Verification Documents"}
        </p>
        <div className="flex gap-2 mt-4">
          <div className={`h-2 flex-1 rounded-full ${step >= 1 ? 'bg-primary' : 'bg-muted'}`} />
          {isTasker && <div className={`h-2 flex-1 rounded-full ${step >= 2 ? 'bg-primary' : 'bg-muted'}`} />}
        </div>
      </div>

      {step === 1 && (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4">
          <div className="space-y-2">
            <Label htmlFor="phone">Phone Number *</Label>
            <Input
              id="phone"
              value={formData.phone}
              onChange={e => setFormData(s => ({ ...s, phone: e.target.value }))}
              placeholder="+92 300 1234567"
              disabled={isLoading}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="location">City *</Label>
            <Input
              id="location"
              value={formData.location}
              onChange={e => setFormData(s => ({ ...s, location: e.target.value }))}
              placeholder="e.g. Lahore, Karachi"
              disabled={isLoading}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="bio">About You (Optional)</Label>
            <textarea
              id="bio"
              value={formData.bio}
              onChange={e => setFormData(s => ({ ...s, bio: e.target.value }))}
              className="flex min-h-[100px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              placeholder="Tell clients a bit about yourself and your skills..."
              disabled={isLoading}
            />
          </div>
        </div>
      )}

      {step === 2 && isTasker && (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4">
          <div className="bg-blue-50 dark:bg-blue-900/20 text-blue-800 dark:text-blue-200 p-4 rounded-lg text-sm mb-6">
            To maintain a safe community, all taskers must provide a valid CNIC for identity verification. Your documents are securely encrypted.
          </div>
          
          <div className="space-y-4">
            <Label>CNIC Front Side *</Label>
            <div className="border-2 border-dashed rounded-xl p-8 text-center hover:bg-muted/50 transition-colors">
              <input 
                type="file" 
                id="cnic-front" 
                className="hidden" 
                accept="image/*"
                onChange={e => {
                  if (e.target.files && e.target.files[0]) {
                    setCnicFrontFile(e.target.files[0])
                  }
                }}
              />
              <Label htmlFor="cnic-front" className="cursor-pointer flex flex-col items-center gap-3">
                {cnicFrontFile ? (
                  <>
                    <CheckCircle className="h-10 w-10 text-green-500" />
                    <span className="font-medium">{cnicFrontFile.name}</span>
                    <span className="text-xs text-muted-foreground">Click to change</span>
                  </>
                ) : (
                  <>
                    <UploadCloud className="h-10 w-10 text-muted-foreground" />
                    <span className="font-medium">Upload Front of CNIC</span>
                    <span className="text-xs text-muted-foreground">JPG, PNG up to 5MB</span>
                  </>
                )}
              </Label>
            </div>
          </div>

          <div className="space-y-4">
            <Label>CNIC Back Side *</Label>
            <div className="border-2 border-dashed rounded-xl p-8 text-center hover:bg-muted/50 transition-colors">
              <input 
                type="file" 
                id="cnic-back" 
                className="hidden" 
                accept="image/*"
                onChange={e => {
                  if (e.target.files && e.target.files[0]) {
                    setCnicBackFile(e.target.files[0])
                  }
                }}
              />
              <Label htmlFor="cnic-back" className="cursor-pointer flex flex-col items-center gap-3">
                {cnicBackFile ? (
                  <>
                    <CheckCircle className="h-10 w-10 text-green-500" />
                    <span className="font-medium">{cnicBackFile.name}</span>
                    <span className="text-xs text-muted-foreground">Click to change</span>
                  </>
                ) : (
                  <>
                    <UploadCloud className="h-10 w-10 text-muted-foreground" />
                    <span className="font-medium">Upload Back of CNIC</span>
                    <span className="text-xs text-muted-foreground">JPG, PNG up to 5MB</span>
                  </>
                )}
              </Label>
            </div>
          </div>
        </div>
      )}

      <div className="flex gap-4 mt-8 pt-6 border-t">
        {step > 1 && (
          <Button 
            variant="outline" 
            onClick={() => setStep(1)}
            disabled={isLoading}
          >
            Back
          </Button>
        )}
        <Button 
          className="flex-1" 
          onClick={handleNext}
          disabled={isLoading}
        >
          {isLoading ? (
             <svg className="mr-2 h-4 w-4 animate-spin" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
          ) : step === totalSteps ? "Complete Profile" : "Continue"}
        </Button>
      </div>
    </div>
  )
}

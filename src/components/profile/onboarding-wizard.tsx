"use client"

import * as React from "react"
import { useRouter } from "@/i18n/routing"
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
  const t = useTranslations("OnboardingWizard")
  const [step, setStep] = React.useState(1)
  const [isLoading, setIsLoading] = React.useState(false)
  const router = useRouter()
  const supabase = createClient()
  
  const isTasker = profile?.role === 'tasker'
  const totalSteps = isTasker ? 3 : 1

  const [formData, setFormData] = React.useState({
    phone: profile?.phone || "",
    location: profile?.location || "",
    bio: profile?.bio || "",
  })

  // Tasker specific state
  const [cnicFrontFile, setCnicFrontFile] = React.useState<File | null>(null)
  const [cnicBackFile, setCnicBackFile] = React.useState<File | null>(null)
  const [certificateFile, setCertificateFile] = React.useState<File | null>(null)
  
  const [taskerData, setTaskerData] = React.useState({
    hourlyRate: 1000,
    skills: "General Tasks, Delivery",
    categories: [] as string[],
    availabilityDays: ["Mon", "Tue", "Wed", "Thu", "Fri"] as string[]
  })

  // Available options
  const allCategories = [
    { id: "cat-1", name: "Furniture Assembly" },
    { id: "cat-2", name: "Home Cleaning" },
    { id: "cat-3", name: "Moving Help" },
    { id: "cat-4", name: "Mounting" },
    { id: "cat-5", name: "Plumbing" },
    { id: "cat-6", name: "Electrical" },
    { id: "cat-7", name: "Painting" },
    { id: "cat-8", name: "Yard Work" },
    { id: "cat-9", name: "Delivery" },
    { id: "cat-10", name: "Personal Assistant" },
    { id: "cat-11", name: "Home Repairs" },
    { id: "cat-12", name: "Heavy Lifting" },
  ]
  const allDays = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"]

  const uploadDocument = async (file: File, prefix: string) => {
    const fileExt = file.name.split('.').pop()
    const fileName = `${prefix}_${Math.random()}.${fileExt}`
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
        toast.error(t("error_required"))
        return
      }
      
      if (isTasker) {
        setStep(2)
      } else {
        await completeOnboarding()
      }
    } else if (step === 2) {
      if (!cnicFrontFile || !cnicBackFile) {
        toast.error(t("error_cnic"))
        return
      }
      setStep(3)
    } else if (step === 3) {
      if (taskerData.categories.length === 0) {
        toast.error(t("error_category"))
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
      let certificateUrl = profile?.certificate_url

      if (isTasker) {
        if (cnicFrontFile) {
          frontUrl = await uploadDocument(cnicFrontFile, 'cnic_front')
        }
        if (cnicBackFile) {
          backUrl = await uploadDocument(cnicBackFile, 'cnic_back')
        }
        if (certificateFile) {
          certificateUrl = await uploadDocument(certificateFile, 'certificate')
        }
      }

      const updates = {
        auth_id: user.id,
        phone: formData.phone,
        location: formData.location,
        bio: formData.bio,
        ...(isTasker ? {
          cnic_url: frontUrl,
          cnic_back_url: backUrl,
          cnic_status: 'pending', // trigger review
          certificate_url: certificateUrl
        } : {}),
        updated_at: new Date()
      }

      const { data: updatedProfile, error } = await supabase
        .from('profiles')
        .upsert(updates, { onConflict: 'auth_id' })
        .select('id')
        .single()

      if (error) throw error

      const profileId = updatedProfile?.id || profile?.id

      if (isTasker && profileId) {
        const skillsArray = taskerData.skills.split(',').map(s => s.trim()).filter(s => s.length > 0)
        
        const { error: taskerError } = await supabase
          .from('tasker_profiles')
          .upsert({
            profile_id: profileId,
            city: formData.location,
            active: true,
            hourly_rate: taskerData.hourlyRate,
            skills: skillsArray,
            categories: taskerData.categories,
            availability_days: taskerData.availabilityDays
          }, { onConflict: 'profile_id' })
          
        if (taskerError) {
          console.error("Tasker profile creation error:", taskerError)
        }
      }

      toast.success(t("success_msg"))
      router.push("/dashboard")
      router.refresh()
    } catch (err: any) {
      toast.error(err.message || t("error_msg"))
      setIsLoading(false)
    }
  }

  const toggleCategory = (id: string) => {
    setTaskerData(prev => ({
      ...prev,
      categories: prev.categories.includes(id) 
        ? prev.categories.filter(c => c !== id)
        : [...prev.categories, id]
    }))
  }

  const toggleDay = (day: string) => {
    setTaskerData(prev => ({
      ...prev,
      availabilityDays: prev.availabilityDays.includes(day) 
        ? prev.availabilityDays.filter(d => d !== day)
        : [...prev.availabilityDays, day]
    }))
  }

  const stepName = step === 1 ? t("step_1") : step === 2 ? t("step_2") : t("step_3")

  return (
    <div className="max-w-xl mx-auto w-full bg-card p-6 md:p-8 rounded-2xl shadow-sm border">
      <div className="mb-8">
        <h2 className="text-2xl font-bold tracking-tight">{t("title")}</h2>
        <p className="text-muted-foreground mt-2">
          {t("step_desc", { step, totalSteps, stepName })}
        </p>
        <div className="flex gap-2 mt-4">
          <div className={`h-2 flex-1 rounded-full ${step >= 1 ? 'bg-primary' : 'bg-muted'}`} />
          {isTasker && <div className={`h-2 flex-1 rounded-full ${step >= 2 ? 'bg-primary' : 'bg-muted'}`} />}
          {isTasker && <div className={`h-2 flex-1 rounded-full ${step >= 3 ? 'bg-primary' : 'bg-muted'}`} />}
        </div>
      </div>

      {step === 1 && (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4">
          <div className="space-y-2">
            <Label htmlFor="phone">{t("phone_label")}</Label>
            <Input
              id="phone"
              value={formData.phone}
              onChange={e => setFormData(s => ({ ...s, phone: e.target.value }))}
              placeholder={t("phone_placeholder")}
              disabled={isLoading}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="location">{t("city_label")}</Label>
            <Input
              id="location"
              value={formData.location}
              onChange={e => setFormData(s => ({ ...s, location: e.target.value }))}
              placeholder={t("city_placeholder")}
              disabled={isLoading}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="bio">{t("bio_label")}</Label>
            <textarea
              id="bio"
              value={formData.bio}
              onChange={e => setFormData(s => ({ ...s, bio: e.target.value }))}
              className="flex min-h-[100px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              placeholder={t("bio_placeholder")}
              disabled={isLoading}
            />
          </div>
        </div>
      )}

      {step === 2 && isTasker && (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4">
          {profile?.cnic_status === "rejected" ? (
            <div className="bg-destructive/10 text-destructive border border-destructive/20 p-4 rounded-xl text-sm mb-6 flex flex-col gap-1">
              <span className="font-semibold">{t("cnic_rejected_title")}</span>
              <span>{t("cnic_rejected_desc")}</span>
            </div>
          ) : (
            <div className="bg-blue-50 dark:bg-blue-900/20 text-blue-800 dark:text-blue-200 p-4 rounded-lg text-sm mb-6">
              {t("cnic_notice")}
            </div>
          )}
          
          <div className="space-y-4">
            <Label>{t("cnic_front_label")}</Label>
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
                    <span className="text-xs text-muted-foreground">{t("cnic_click_change")}</span>
                  </>
                ) : (
                  <>
                    <UploadCloud className="h-10 w-10 text-muted-foreground" />
                    <span className="font-medium">{t("upload_front")}</span>
                    <span className="text-xs text-muted-foreground">{t("upload_format")}</span>
                  </>
                )}
              </Label>
            </div>
          </div>

          <div className="space-y-4">
            <Label>{t("cnic_back_label")}</Label>
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
                    <span className="text-xs text-muted-foreground">{t("cnic_click_change")}</span>
                  </>
                ) : (
                  <>
                    <UploadCloud className="h-10 w-10 text-muted-foreground" />
                    <span className="font-medium">{t("upload_back")}</span>
                    <span className="text-xs text-muted-foreground">{t("upload_format")}</span>
                  </>
                )}
              </Label>
            </div>
          </div>

          <div className="space-y-4 pt-4 border-t border-border/50">
            <Label>{t("certificate_label")}</Label>
            <p className="text-[11px] text-muted-foreground -mt-1 leading-relaxed">{t("certificate_notice")}</p>
            <div className="border-2 border-dashed rounded-xl p-8 text-center hover:bg-muted/50 transition-colors">
              <input 
                type="file" 
                id="certificate-file" 
                className="hidden" 
                accept="image/*,application/pdf"
                onChange={e => {
                  if (e.target.files && e.target.files[0]) {
                    setCertificateFile(e.target.files[0])
                  }
                }}
              />
              <Label htmlFor="certificate-file" className="cursor-pointer flex flex-col items-center gap-3">
                {certificateFile ? (
                  <>
                    <CheckCircle className="h-10 w-10 text-green-500" />
                    <span className="font-medium">{certificateFile.name}</span>
                    <span className="text-xs text-muted-foreground">{t("cnic_click_change")}</span>
                  </>
                ) : (
                  <>
                    <UploadCloud className="h-10 w-10 text-muted-foreground" />
                    <span className="font-medium">{t("upload_certificate")}</span>
                    <span className="text-xs text-muted-foreground">{t("upload_format")}</span>
                  </>
                )}
              </Label>
            </div>
          </div>
        </div>
      )}

      {step === 3 && isTasker && (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4">
          <div className="space-y-2">
            <Label htmlFor="hourlyRate">{t("hourly_rate_label")}</Label>
            <Input
              id="hourlyRate"
              type="number"
              min="300"
              value={taskerData.hourlyRate}
              onChange={e => setTaskerData(s => ({ ...s, hourlyRate: parseInt(e.target.value) || 0 }))}
              disabled={isLoading}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="skills">{t("skills_label")}</Label>
            <Input
              id="skills"
              value={taskerData.skills}
              onChange={e => setTaskerData(s => ({ ...s, skills: e.target.value }))}
              placeholder={t("skills_placeholder")}
              disabled={isLoading}
            />
          </div>

          <div className="space-y-3">
            <Label>{t("categories_label")}</Label>
            <div className="grid grid-cols-2 gap-2">
              {allCategories.map(cat => (
                <label key={cat.id} className="flex items-center space-x-2 border p-2 rounded-lg cursor-pointer hover:bg-muted/50">
                  <input
                    type="checkbox"
                    checked={taskerData.categories.includes(cat.id)}
                    onChange={() => toggleCategory(cat.id)}
                    className="rounded border-gray-300 text-owl-violet focus:ring-owl-violet"
                    disabled={isLoading}
                  />
                  <span className="text-sm">{cat.name}</span>
                </label>
              ))}
            </div>
          </div>

          <div className="space-y-3">
            <Label>{t("availability_label")}</Label>
            <div className="flex flex-wrap gap-2">
              {allDays.map(day => (
                <button
                  key={day}
                  type="button"
                  onClick={() => toggleDay(day)}
                  disabled={isLoading}
                  className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
                    taskerData.availabilityDays.includes(day)
                      ? "bg-owl-violet text-white"
                      : "bg-muted text-muted-foreground hover:bg-muted/80"
                  }`}
                >
                  {day}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      <div className="flex gap-4 mt-8 pt-6 border-t">
        {step > 1 && (
          <Button 
            variant="outline" 
            onClick={() => setStep(step - 1)}
            disabled={isLoading}
          >
            {t("back_btn")}
          </Button>
        )}
        <Button 
          className="flex-1" 
          onClick={handleNext}
          disabled={isLoading}
        >
          {isLoading ? (
             <svg className="mr-2 h-4 w-4 animate-spin" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
          ) : step === totalSteps ? t("complete_btn") : t("continue_btn")}
        </Button>
      </div>
    </div>
  )
}

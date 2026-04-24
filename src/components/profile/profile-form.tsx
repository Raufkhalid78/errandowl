"use client"

import * as React from "react"
import { useRouter } from "next/navigation"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { createClient } from "@/lib/supabase/client"

export function ProfileForm({
  initialProfile,
  userEmail,
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement> & { initialProfile: any; userEmail?: string }) {
  const [isLoading, setIsLoading] = React.useState<boolean>(false)
  const [success, setSuccess] = React.useState<boolean>(false)
  const [error, setError] = React.useState<string | null>(null)
  const router = useRouter()
  const supabase = createClient()

  async function onSubmit(event: React.SyntheticEvent) {
    event.preventDefault()
    setIsLoading(true)
    setError(null)
    setSuccess(false)

    const target = event.target as typeof event.target & {
      name: { value: string }
      phone: { value: string }
      location: { value: string }
      bio: { value: string }
    }

    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        setError("You must be logged in to update your profile.")
        setIsLoading(false)
        return
    }

    const updates = {
      auth_id: user.id,
      name: target.name.value,
      phone: target.phone.value,
      location: target.location.value,
      bio: target.bio.value,
      updated_at: new Date(),
    }

    // Upsert the profile record
    const { error: updateError } = await supabase
      .from("profiles")
      .upsert(updates, { onConflict: 'auth_id' })

    if (updateError) {
      setError(updateError.message)
      setIsLoading(false)
      return
    }

    setSuccess(true)
    setIsLoading(false)
    router.refresh()
  }

  return (
    <div className={"grid gap-6 " + (className || "")} {...props}>
      <form onSubmit={onSubmit}>
        <div className="grid gap-4">
          <div className="grid gap-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              disabled={true}
              defaultValue={userEmail}
            />
            <p className="text-[0.8rem] text-muted-foreground">Your email cannot be changed here.</p>
          </div>
          <div className="grid gap-2">
            <Label htmlFor="name">Full Name</Label>
            <Input
              id="name"
              placeholder="Ali Khan"
              type="text"
              defaultValue={initialProfile?.name || ""}
              disabled={isLoading}
              required
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="phone">Phone Number</Label>
            <Input
              id="phone"
              placeholder="+92 300 1234567"
              type="tel"
              defaultValue={initialProfile?.phone || ""}
              disabled={isLoading}
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="location">Location (City)</Label>
            <Input
              id="location"
              placeholder="Lahore, Punjab"
              type="text"
              defaultValue={initialProfile?.location || ""}
              disabled={isLoading}
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="bio">Bio</Label>
            <textarea
              id="bio"
              className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              placeholder="Tell us a bit about yourself..."
              defaultValue={initialProfile?.bio || ""}
              disabled={isLoading}
            />
          </div>
          {error && <div className="text-sm text-red-500 font-medium">{error}</div>}
          {success && <div className="text-sm text-green-500 font-medium">Profile updated successfully!</div>}
          <Button type="submit" disabled={isLoading}>
            {isLoading && (
              <svg
                className="mr-2 h-4 w-4 animate-spin"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                ></circle>
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                ></path>
              </svg>
            )}
            Update Profile
          </Button>
        </div>
      </form>
    </div>
  )
}

"use client"

import * as React from "react"
import { useRouter } from "@/i18n/routing"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import { useTranslations } from "next-intl"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { createClient } from "@/lib/supabase/client"

export function SignupForm({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  const [isLoading, setIsLoading] = React.useState<boolean>(false)
  const [error, setError] = React.useState<string | null>(null)
  const router = useRouter()
  const supabase = createClient()
  const t = useTranslations("Auth.signup")

  const handleGoogleSignUp = async () => {
    setIsLoading(true)
    setError(null)

    // Retrieve the chosen role from select dropdown in the form
    const roleSelect = document.getElementById("role") as HTMLSelectElement | null
    const chosenRole = roleSelect?.value || "client"

    // Save selected role in temporary cookie for the callback route
    document.cookie = `signup_role=${chosenRole}; path=/; max-age=600; SameSite=Lax`

    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${window.location.origin}/api/auth/callback`,
      },
    })

    if (error) {
      setError(error.message)
      toast.error(error.message)
      setIsLoading(false)
    }
  }

  async function onSubmit(event: React.SyntheticEvent) {
    event.preventDefault()
    setIsLoading(true)
    setError(null)

    const target = event.target as typeof event.target & {
      name: { value: string }
      email: { value: string }
      password: { value: string }
      role: { value: string }
    }

    const { error: signUpError } = await supabase.auth.signUp({
      email: target.email.value,
      password: target.password.value,
      options: {
        data: {
          full_name: target.name.value,
          role: target.role.value,
        }
      }
    })

    if (signUpError) {
      setError(t("error"))
      toast.error(t("error"))
      setIsLoading(false)
      return
    }

    toast.success(t("success"))
    router.push(`/login?message=${encodeURIComponent(t("success"))}`)
  }

  return (
    <div className={"grid gap-6 " + (className || "")} {...props}>
      <form onSubmit={onSubmit}>
        <div className="grid gap-4">
          <div className="grid gap-2">
            <Label htmlFor="name">{t("name")}</Label>
            <Input
              id="name"
              name="name"
              placeholder={t("namePlaceholder")}
              type="text"
              autoCapitalize="words"
              disabled={isLoading}
              required
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="email">{t("email")}</Label>
            <Input
              id="email"
              name="email"
              placeholder={t("emailPlaceholder")}
              type="email"
              autoCapitalize="none"
              autoComplete="email"
              autoCorrect="off"
              disabled={isLoading}
              required
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="password">{t("password")}</Label>
            <Input
              id="password"
              name="password"
              type="password"
              disabled={isLoading}
              required
            />
          </div>
          <div className="grid gap-2">
             <Label htmlFor="role">{t("roleLabel")}</Label>
             <select 
               id="role" 
               name="role"
               className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
               disabled={isLoading}
               required
             >
               <option value="client">{t("roleClient")}</option>
               <option value="tasker">{t("roleTasker")}</option>
             </select>
          </div>
          {error && <div className="text-sm text-red-500 font-medium">{error}</div>}
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
            {t("submit")}
          </Button>
        </div>
      </form>
      <div className="relative my-2">
        <div className="absolute inset-0 flex items-center">
          <span className="w-full border-t" />
        </div>
        <div className="relative flex justify-center text-xs uppercase">
          <span className="bg-background px-2 text-muted-foreground">
            {t("orContinueWith") || "Or continue with"}
          </span>
        </div>
      </div>
      <Button 
        type="button" 
        variant="outline" 
        disabled={isLoading} 
        onClick={handleGoogleSignUp}
        className="w-full h-11 flex items-center justify-center gap-2"
      >
        <svg className="h-4 w-4" viewBox="0 0 24 24">
          <path
            fill="#EA4335"
            d="M5.266 9.765A7.077 7.077 0 0 1 12 4.909c1.69 0 3.218.6 4.418 1.582L19.91 3C17.782 1.145 15.055 0 12 0 7.27 0 3.16 2.7 1.09 6.645l4.176 3.12z"
          />
          <path
            fill="#34A853"
            d="M16.04 15.345c-1.11.727-2.5 1.155-4.04 1.155a7.077 7.077 0 0 1-6.734-4.855L1.09 14.764C3.16 18.709 7.27 21.409 12 21.409c3.09 0 5.864-1.09 7.9-3l-3.86-3.064z"
          />
          <path
            fill="#4285F4"
            d="M23.49 12.273c0-.818-.073-1.609-.2-2.364H12v4.51h6.47c-.28 1.482-1.12 2.736-2.38 3.582l3.86 3.064c2.255-2.082 3.54-5.145 3.54-8.79z"
          />
          <path
            fill="#FBBC05"
            d="M5.266 14.235A7.09 7.09 0 0 1 4.91 12c0-.79.127-1.555.356-2.264L1.09 6.61A11.966 11.966 0 0 0 0 12c0 1.927.455 3.745 1.255 5.364l3.973-3.13z"
          />
        </svg>
        Google
      </Button>
    </div>
  )
}

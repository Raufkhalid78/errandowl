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
    </div>
  )
}

"use client"

import * as React from "react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { useTranslations } from "next-intl"
import { motion } from "framer-motion"
import { Link } from "@/i18n/routing"

import { Booking } from "@/types"

export function JobsList({ jobs }: { jobs: Booking[] }) {
  const t = useTranslations("DashboardJobs")

  if (!jobs || jobs.length === 0) {
    return (
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="flex flex-col items-center justify-center p-12 text-center border border-dashed rounded-2xl bg-muted/20"
      >
        <div className="text-5xl mb-4 opacity-50">📋</div>
        <h3 className="text-lg font-medium">{t("noJobsTitle")}</h3>
        <p className="text-sm text-muted-foreground mt-2 max-w-sm">
          {t("noJobsDesc")}
        </p>
      </motion.div>
    )
  }

  return (
    <motion.div 
      variants={{ hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.1 } } }}
      initial="hidden" animate="show"
      className="grid gap-4 sm:grid-cols-2"
    >
      {jobs.map((job) => {
        const initials = job.profiles?.name
          ? job.profiles.name.split(" ").map((n: string) => n[0]).join("").toUpperCase()
          : "U"

        return (
          <motion.div variants={{ hidden: { opacity: 0, y: 15 }, show: { opacity: 1, y: 0 } }} key={job.id}>
            <Card className="flex flex-col h-full hover-lift transition-all">
            <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-2">
              <div className="flex flex-col space-y-1">
                <CardTitle className="text-base">{job.location}</CardTitle>
                <CardDescription className="text-xs">
                  {t("timeAndHours", { date: job.date, time: job.time, hours: job.estimated_hours || 0 })}
                </CardDescription>
              </div>
              <Badge variant="secondary">{t("pending")}</Badge>
            </CardHeader>
            <CardContent className="flex-1">
              <p className="text-sm line-clamp-3 mt-2">{(job as any).description}</p>
              
              <div className="flex items-center space-x-2 mt-4">
                <Avatar className="h-6 w-6">
                  <AvatarImage src={job.profiles?.avatar_url} alt={job.profiles?.name} />
                  <AvatarFallback className="text-[10px]">{initials}</AvatarFallback>
                </Avatar>
                <span className="text-xs text-muted-foreground">
                  {t("requestedBy", { name: job.profiles?.name || "Client" })}
                </span>
              </div>
            </CardContent>
            <CardFooter>
              <Button className="w-full bg-owl-violet hover:bg-owl-violet-dark text-white" render={<Link href={`/dashboard/jobs/${job.id}`} />}>
                View Details & Bid
              </Button>
            </CardFooter>
            </Card>
          </motion.div>
        )
      })}
    </motion.div>
  )
}

"use client"

import * as React from "react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"

export function JobsList({ jobs }: { jobs: any[] }) {
  if (!jobs || jobs.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center p-8 text-center border rounded-lg bg-muted/20">
        <h3 className="text-lg font-medium">No Open Jobs</h3>
        <p className="text-sm text-muted-foreground mt-2">
          There are currently no open jobs available in your area. Check back later!
        </p>
      </div>
    )
  }

  return (
    <div className="grid gap-4 sm:grid-cols-2">
      {jobs.map((job) => {
        const initials = job.profiles?.name
          ? job.profiles.name.split(" ").map((n: string) => n[0]).join("").toUpperCase()
          : "U"

        return (
          <Card key={job.id} className="flex flex-col">
            <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-2">
              <div className="flex flex-col space-y-1">
                <CardTitle className="text-base">{job.location}</CardTitle>
                <CardDescription className="text-xs">
                  {job.date} at {job.time} • Est. {job.estimated_hours} hrs
                </CardDescription>
              </div>
              <Badge variant="secondary">Pending</Badge>
            </CardHeader>
            <CardContent className="flex-1">
              <p className="text-sm line-clamp-3 mt-2">{job.description}</p>
              
              <div className="flex items-center space-x-2 mt-4">
                <Avatar className="h-6 w-6">
                  <AvatarImage src={job.profiles?.avatar} alt={job.profiles?.name} />
                  <AvatarFallback className="text-[10px]">{initials}</AvatarFallback>
                </Avatar>
                <span className="text-xs text-muted-foreground">Requested by {job.profiles?.name || "Client"}</span>
              </div>
            </CardContent>
            <CardFooter>
              <Button className="w-full">Accept Job / Bid</Button>
            </CardFooter>
          </Card>
        )
      })}
    </div>
  )
}

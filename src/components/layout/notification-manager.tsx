"use client"

import { useEffect } from "react"
import { createClient } from "@/lib/supabase/client"
import { initializeApp } from "firebase/app"
import { getMessaging, getToken, onMessage } from "firebase/messaging"
import { toast } from "sonner"

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY || "AIzaSyAMw6C4KAJmWK0DTcepYH6gOOqgFS-YG8U",
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || "errandowl-178.firebaseapp.com",
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || "errandowl-178",
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || "errandowl-178.firebasestorage.app",
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || "694782630826",
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID || "1:694782630826:web:27f2a92ba556661c9ea9d3",
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID || "G-MK6BE458QR"
}

export function NotificationManager() {
  const supabase = createClient()

  useEffect(() => {
    // We only want to run this on the client
    if (typeof window === "undefined" || !("Notification" in window)) return

    const initializePush = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) return

        const permission = await Notification.requestPermission()
        
        if (permission === "granted") {
          const app = initializeApp(firebaseConfig)
          const messaging = getMessaging(app)
          
          let registration: any;
          try {
            registration = await navigator.serviceWorker.register('/firebase-messaging-sw.js', {
              scope: '/firebase-cloud-messaging-push-scope'
            })
            console.log("Firebase SW registered with scope:", registration.scope)

            await new Promise((resolve) => {
              if (registration.active) {
                resolve(true);
              } else {
                const worker = registration.installing || registration.waiting;
                if (worker) {
                  worker.addEventListener('statechange', (e: any) => {
                    if (e.target.state === 'activated') resolve(true);
                  });
                }
              }
            });
            
          } catch (err) {
            console.error("Failed to register firebase SW", err)
          }

          const vapidKey = process.env.NEXT_PUBLIC_FIREBASE_VAPID_KEY || "BFzi7om6qJ25yoEOZ-SSUFNfovsxpKqu7PzVrT8ErBTBVQ-InhMz1EZbNFIn-QQnleJb4IX7VKSgIn6qf8zIvCc";

          const token = await getToken(messaging, { 
            vapidKey,
            serviceWorkerRegistration: registration
          })
          
          if (token) {
            if (process.env.NODE_ENV !== "production") {
              console.log("🔥 YOUR FCM TOKEN FOR TESTING:", token)
            }
            await supabase.from("profiles").update({ fcm_token: token }).eq("auth_id", user.id)
          }
          
          onMessage(messaging, (payload) => {
            if (payload.notification) {
              toast.info(payload.notification.title, {
                description: payload.notification.body
              })
            }
          })
          
          console.log("Push notifications enabled.")
        }
      } catch (error) {
        console.error("Error setting up push notifications:", error)
      }
    }

    const timer = setTimeout(() => {
      initializePush()
    }, 5000)

    return () => clearTimeout(timer)
  }, [supabase])

  return null
}

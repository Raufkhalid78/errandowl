"use client"

import { useEffect } from "react"
import { createClient } from "@/lib/supabase/client"
import { initializeApp } from "firebase/app"
import { getMessaging, getToken, onMessage } from "firebase/messaging"
import { toast } from "sonner"

const firebaseConfig = {
  apiKey: "AIzaSyAMw6C4KAJmWK0DTcepYH6gOOqgFS-YG8U",
  authDomain: "errandowl-178.firebaseapp.com",
  projectId: "errandowl-178",
  storageBucket: "errandowl-178.firebasestorage.app",
  messagingSenderId: "694782630826",
  appId: "1:694782630826:web:27f2a92ba556661c9ea9d3",
  measurementId: "G-MK6BE458QR"
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
          
          // Explicitly register our firebase service worker so it doesn't conflict with next-pwa
          let registration: any;
          try {
            registration = await navigator.serviceWorker.register('/firebase-messaging-sw.js', {
              scope: '/firebase-cloud-messaging-push-scope'
            })
            console.log("Firebase SW registered with scope:", registration.scope)

            // Wait until the service worker is active before subscribing
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

          // Replace "YOUR_VAPID_KEY_HERE" with the actual Web Push certificate from Firebase Console
          const token = await getToken(messaging, { 
            vapidKey: "BFzi7om6qJ25yoEOZ-SSUFNfovsxpKqu7PzVrT8ErBTBVQ-InhMz1EZbNFIn-QQnleJb4IX7VKSgIn6qf8zIvCc",
            serviceWorkerRegistration: registration
          })
          
          if (token) {
            console.log("🔥 YOUR FCM TOKEN FOR TESTING:", token)
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

    // Try to initialize after a short delay to not block main thread rendering
    const timer = setTimeout(() => {
      initializePush()
    }, 5000)

    return () => clearTimeout(timer)
  }, [supabase])

  return null // This component doesn't render anything
}

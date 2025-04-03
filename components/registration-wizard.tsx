"use client"

import { useState, useCallback } from "react"
import { motion, AnimatePresence } from "framer-motion"
import UserProfileStep from "./wizard-steps/user-profile-step"
import EventPreferencesStep from "./wizard-steps/event-preferences-step"
import CompletionStep from "./wizard-steps/completion-step"
import AuthStep from "./wizard-steps/auth-step"
import WizardProgress from "./wizard-progress"
import { Button } from "@/components/ui/button"
import { ChevronLeft, ChevronRight, Save } from "lucide-react"
import { useMediaQuery } from "@/hooks/use-media-query"
import { useToast } from "@/hooks/use-toast"
import { supabase } from "@/lib/supabase"
import { useRouter } from "next/navigation"

interface Step {
  title: string;
  description: string;
  component: React.ReactNode;
}

interface CalendarEvent {
  date: string;
  status: string;
  description: string;
}

interface Deliverable {
  title: string;
  date: string;
  note: string;
}

interface UserProfileData {
  name: string;
  location: string;
  currentTravelLocation?: string;
  languages: string[];
  personalityTraits: string[];
  goals: string[];
}

interface EventPreferencesData {
  categories: string[];
  vibeKeywords: string[];
  idealTimeSlots: string[];
  budget: string;
  preferredGroupType: string[];
  preferredEventSize: string[];
  maxDistanceKm: number;
  restrictions: {
    avoidFamilyKidsEvents: boolean;
    avoidCrowdedDaytimeConferences: boolean;
    avoidOverlyFormalNetworking: boolean;
  };
}

interface RestrictionsData {
  avoidFamilyKidsEvents: boolean
  avoidCrowdedDaytimeConferences: boolean
  avoidOverlyFormalNetworking: boolean
}

interface HistoryData {
  recentEventsAttended: any[];
  eventFeedback: any[];
}

interface IdealOutcome {
  description: string;
}

interface AuthData {
  email: string;
  password: string;
  confirmPassword?: string;
}

interface FormData {
  auth: AuthData;
  userProfile: UserProfileData;
  eventPreferences: EventPreferencesData;
}

interface StepProps {
  data: any;
  updateData: (data: any) => void;
  isMobile: boolean;
}

export default function RegistrationWizard() {
  const [currentStep, setCurrentStep] = useState(0)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isSaving, setIsSaving] = useState(false)
  const [saveCompleted, setSaveCompleted] = useState(false)
  const { toast } = useToast()
  const [isMobile, setIsMobile] = useState(false)
  const router = useRouter()
  const [formData, setFormData] = useState<FormData>({
    auth: {
      email: "",
      password: "",
      confirmPassword: "",
    },
    userProfile: {
      name: "",
      location: "",
      currentTravelLocation: "",
      languages: [],
      personalityTraits: [],
      goals: [],
    },
    eventPreferences: {
      categories: [],
      vibeKeywords: [],
      idealTimeSlots: [],
      budget: "medium",
      preferredGroupType: [],
      preferredEventSize: [],
      maxDistanceKm: 1000,
      restrictions: {
        avoidFamilyKidsEvents: false,
        avoidCrowdedDaytimeConferences: false,
        avoidOverlyFormalNetworking: false
      },
    },
  })

  const isTablet = useMediaQuery("(min-width: 641px) and (max-width: 1024px)")
  const totalSteps = 4

  const updateFormData = useCallback((section: keyof FormData, data: Partial<FormData[keyof FormData]>) => {
    setFormData((prev) => ({
      ...prev,
      [section]: {
        ...prev[section],
        ...data,
      },
    }))
  }, [])

  const handleNext = () => {
    if (currentStep < totalSteps - 1) {
      setCurrentStep(currentStep + 1)
      if (isMobile) {
        window.scrollTo({ top: 0, behavior: "smooth" })
      }
    }
  }

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1)
      if (isMobile) {
        window.scrollTo({ top: 0, behavior: "smooth" })
      }
    }
  }

  const handleSubmit = async () => {
    try {
      setIsSubmitting(true)
      setError(null)
      setIsSaving(true)
      setSaveCompleted(false)
      
      // Show persistent toast while saving
      const savingToast = toast({
        title: "Saving Profile",
        description: "Please wait while we save your profile information...",
        variant: "default",
      })

      // Validate passwords match
      if (formData.auth.password !== formData.auth.confirmPassword) {
        throw new Error("Passwords do not match")
      }

      // 1. Create Supabase user
      console.log("Creating Supabase user...")
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: formData.auth.email,
        password: formData.auth.password,
        options: {
          emailRedirectTo: `${window.location.origin}/login`,
        }
      })

      if (authError) {
        throw new Error(`Authentication error: ${authError.message}`)
      }

      if (!authData.user) {
        throw new Error("Failed to create user account")
      }

      console.log("User created successfully:", authData.user.id)

      // 2. Send user registration data to API
      const requestBody = {
        userId: authData.user.id,
        email: formData.auth.email,
        userProfile: formData.userProfile,
        eventPreferences: formData.eventPreferences,
      }

      console.log("Sending request to /api/register:", requestBody)

      const response = await fetch("/api/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Accept": "application/json"
        },
        body: JSON.stringify(requestBody),
      })

      console.log("Response status:", response.status)
      console.log("Response headers:", Object.fromEntries(response.headers.entries()))
      
      const text = await response.text()
      console.log("Raw response text:", text)

      // If the response is empty, handle it gracefully
      if (!text.trim()) {
        console.warn("Received empty response from server")
        throw new Error(`Server returned empty response with status ${response.status}`)
      }

      let data = null
      try {
        data = JSON.parse(text)
      } catch (e) {
        // If we got HTML instead of JSON, make the error more helpful
        if (text.trim().startsWith("<!DOCTYPE html>") || text.trim().startsWith("<html")) {
          throw new Error("Server returned HTML instead of JSON. This might indicate a server error.")
        }
        
        throw new Error(`Invalid JSON response from server (Status: ${response.status})`)
      }

      if (!response.ok) {
        const errorMessage = data?.message || data?.error || `Registration failed: ${response.status} ${response.statusText}`
        throw new Error(errorMessage)
      }

      // Dismiss the saving toast
      savingToast.dismiss()
      toast({
        title: "Success!",
        description: "Your profile has been created successfully. Please check your email to verify your account.",
        variant: "default",
      })
      
      setIsSaving(false)
      setSaveCompleted(true)
      
      // Redirect to login page after a short delay
      setTimeout(() => {
        router.push('/login')
      }, 2000)
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Failed to create profile"
      setError(errorMessage)
      setIsSaving(false)
      setSaveCompleted(false)
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      })
      
      // If Supabase user was created but profile saving failed, we might need to clean up
      // Consider adding code here to delete the Supabase user in case of failure
    } finally {
      setIsSubmitting(false)
    }
  }

  const steps: Step[] = [
    {
      title: "Profile",
      description: "Tell us about yourself",
      component: (
        <UserProfileStep
          data={formData.userProfile}
          updateData={(data: UserProfileData) => setFormData({ ...formData, userProfile: data })}
          isMobile={isMobile}
        />
      ),
    },
    {
      title: "Preferences",
      description: "Set your event preferences",
      component: (
        <EventPreferencesStep
          data={formData.eventPreferences}
          updateData={(data: EventPreferencesData) => setFormData({ ...formData, eventPreferences: data })}
          isMobile={isMobile}
        />
      ),
    },
    {
      title: "Create Account",
      description: "Set up your login credentials",
      component: (
        <AuthStep
          data={formData.auth}
          updateData={(data: AuthData) => setFormData({ ...formData, auth: data })}
          isMobile={isMobile}
        />
      ),
    },
    {
      title: "Complete",
      description: "Review your profile",
      component: (
        <CompletionStep
          isMobile={isMobile}
          isSubmitting={isSubmitting}
          isSaving={isSaving}
          saveCompleted={saveCompleted}
          error={error}
          email={formData.auth.email}
        />
      ),
    },
  ]

  return (
    <div className="w-full max-w-4xl mx-auto flex flex-col gap-4">
      {/* Main content card */}
      <motion.div
        className="bg-gray-900/95 backdrop-blur-xl rounded-3xl overflow-hidden border border-gray-800 shadow-xl"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="p-4 sm:p-6 md:p-8">
          <div className="mb-8">
            <WizardProgress
              currentStep={currentStep}
              totalSteps={totalSteps}
              steps={steps}
              isMobile={isMobile}
              isTablet={isTablet}
            />
          </div>

          {error && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-6 p-4 bg-red-900/50 border border-red-800 rounded-lg"
            >
              <p className="text-red-400 text-sm">{error}</p>
            </motion.div>
          )}

          <div className="relative">
            <AnimatePresence mode="wait">
              <motion.div
                key={currentStep}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
                className="w-full"
              >
                {steps[currentStep].component}
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </motion.div>

      {/* Navigation buttons in separate card */}
      <motion.div
        className="bg-gray-900/95 backdrop-blur-xl rounded-2xl border border-gray-800 shadow-lg p-4 sm:p-6"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
      >
        <div className="flex justify-between max-w-4xl mx-auto">
          <Button
            variant="outline"
            onClick={handlePrevious}
            disabled={currentStep === 0 || isSubmitting}
            className="group relative overflow-hidden bg-gray-800/80 border-gray-700 hover:bg-gray-700/80 text-gray-200"
            size={isMobile ? "sm" : "default"}
          >
            <span className="relative z-10 flex items-center">
              <ChevronLeft className={`${isMobile ? "mr-1 h-3 w-3" : "mr-2 h-4 w-4"}`} />
              {isMobile ? "Back" : "Previous"}
            </span>
          </Button>

          {currentStep < totalSteps - 1 ? (
            <Button
              onClick={handleNext}
              disabled={isSubmitting}
              className="group relative overflow-hidden bg-blue-600 hover:bg-blue-700 text-white"
              size={isMobile ? "sm" : "default"}
            >
              <span className="relative z-10 flex items-center">
                {isMobile ? "Next" : "Continue"}
                <ChevronRight className={`${isMobile ? "ml-1 h-3 w-3" : "ml-2 h-4 w-4"}`} />
              </span>
            </Button>
          ) : (
            <Button
              onClick={handleSubmit}
              disabled={isSubmitting || isSaving}
              className="group relative overflow-hidden bg-blue-600 hover:bg-blue-700 text-white"
              size={isMobile ? "sm" : "default"}
            >
              <span className="relative z-10 flex items-center">
                {isSubmitting || isSaving ? "Saving..." : "Save Profile"}
                {!isSubmitting && !isSaving && <Save className={`${isMobile ? "ml-1 h-3 w-3" : "ml-2 h-4 w-4"}`} />}
              </span>
            </Button>
          )}
        </div>
      </motion.div>
    </div>
  );
}
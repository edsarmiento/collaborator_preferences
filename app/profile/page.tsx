"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Edit, User, MapPin, Globe, Languages, Heart, Target, Calendar, Star, Info, Tag, Hash, DollarSign, Compass, Users, CalendarX, Users2, Plane, Map, Clock, Trophy, Edit2, Camera, LogOut, Award, Building, Sun, Snowflake, Flower, Leaf, Plus, X, Save, Tv, Music, Palette, Laptop, BookOpen, Utensils, Flame, Flower2, Scissors, Gamepad2, Music2, Moon, Network, Rocket, Car, Trees, Flag, Paintbrush, Music4, Mountain, Film, LayoutGrid, Search, BarChart, Zap, Activity } from "lucide-react"
import { supabase } from "@/lib/supabase"
import { useRouter } from "next/navigation"
import { useToast } from "@/components/ui/use-toast"
import { Skeleton } from "@/components/ui/skeleton"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar"
import { CircularProgressbar, buildStyles } from "react-circular-progressbar"
import { ProfileSkeleton } from "@/components/skeletons/profile-skeleton"
import { Input } from "@/components/ui/input"
import { cn } from "@/lib/utils"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import DatePicker from "react-datepicker"
import "react-datepicker/dist/react-datepicker.css"

interface UserProfile {
  name: string;
  location: string;
  currentTravelLocation?: string;
  languages: string[];
  personalityTraits: string[];
  hobbiesAndInterests: string[];
  additionalInfo?: string;
  nearestAirport?: string;
  goals: string[];
}

interface EventPreferences {
  seasonalPreferences: string[];
  categories: string[];
  vibeKeywords: string[];
  budget: string;
  preferredExperiences: string[];
  preferredDestinations: string[];
  groupSizePreference: string[];
  blockedDates: string[];
  teamBuildingPrefs: {
    preferredActivities: string[];
    location: "remote" | "in_person" | "both";
    duration: "half_day" | "full_day" | "multi_day";
    suggestions: string;
  };
}

// Add these utility functions before the ProfilePage component
const getExperienceIcon = (level: string) => {
  switch (level) {
    case 'Beginner': return <Star className="h-4 w-4" />
    case 'Intermediate': return <Trophy className="h-4 w-4" />
    case 'Advanced': return <Award className="h-4 w-4" />
    default: return <Star className="h-4 w-4" />
  }
}

const getDestinationIcon = (type: string) => {
  switch (type) {
    case 'Beach': return <Map className="h-4 w-4" />
    case 'Mountain': return <Compass className="h-4 w-4" />
    case 'City': return <Building className="h-4 w-4" />
    default: return <Map className="h-4 w-4" />
  }
}

const getSeasonIcon = (season: string) => {
  switch (season) {
    case 'Summer': return <Sun className="h-4 w-4" />
    case 'Winter': return <Snowflake className="h-4 w-4" />
    case 'Spring': return <Flower className="h-4 w-4" />
    case 'Autumn': return <Leaf className="h-4 w-4" />
    default: return <Calendar className="h-4 w-4" />
  }
}

const getInterestIcon = (interest: string) => {
  switch (interest) {
    case 'Deportes por TV': return <Tv className="h-3 w-3 text-blue-400" />
    case 'Actividades deportivas': return <Trophy className="h-3 w-3 text-yellow-400" />
    case 'Música': return <Music className="h-3 w-3 text-purple-400" />
    case 'Arte': return <Palette className="h-3 w-3 text-pink-400" />
    case 'Tecnología': return <Laptop className="h-3 w-3 text-blue-400" />
    case 'Lectura': return <BookOpen className="h-3 w-3 text-green-400" />
    case 'Cocina': return <Utensils className="h-3 w-3 text-orange-400" />
    case 'Parrilladas al aire libre': return <Flame className="h-3 w-3 text-red-400" />
    case 'Convivencias': return <Users className="h-3 w-3 text-yellow-400" />
    case 'Jardinería': return <Flower2 className="h-3 w-3 text-green-400" />
    case 'Fotografía': return <Camera className="h-3 w-3 text-purple-400" />
    case 'Manualidades': return <Scissors className="h-3 w-3 text-red-400" />
    case 'Videojuegos': return <Gamepad2 className="h-3 w-3 text-indigo-400" />
    case 'Baile': return <Music2 className="h-3 w-3 text-pink-400" />
    case 'Yoga': return <Activity className="h-3 w-3 text-purple-400" />
    case 'Meditación': return <Moon className="h-3 w-3 text-blue-400" />
    case 'Networking': return <Network className="h-3 w-3 text-blue-400" />
    case 'Startups': return <Rocket className="h-3 w-3 text-orange-400" />
    case 'Fórmula 1': return <Car className="h-3 w-3 text-red-400" />
    case 'Naturaleza': return <Trees className="h-3 w-3 text-green-400" />
    case 'Ir al estadio': return <Flag className="h-3 w-3 text-yellow-400" />
    case 'Talleres creativos': return <Paintbrush className="h-3 w-3 text-pink-400" />
    case 'Conciertos': return <Music4 className="h-3 w-3 text-purple-400" />
    case 'Actividades al aire libre': return <Mountain className="h-3 w-3 text-green-400" />
    case 'Cine': return <Film className="h-3 w-3 text-indigo-400" />
    default: return <Heart className="h-3 w-3 text-indigo-400" />
  }
}

const getTraitIcon = (trait: string) => {
  switch (trait) {
    case 'Sociable': return <Users className="h-3 w-3 text-yellow-400" />
    case 'Introvertido': return <User className="h-3 w-3 text-orange-400" />
    case 'Creativo': return <Paintbrush className="h-3 w-3 text-pink-400" />
    case 'Estructurado': return <LayoutGrid className="h-3 w-3 text-red-400" />
    case 'Curioso': return <Search className="h-3 w-3 text-blue-400" />
    case 'Aventurero': return <Compass className="h-3 w-3 text-indigo-400" />
    case 'Analítico': return <BarChart className="h-3 w-3 text-purple-400" />
    case 'Energético': return <Zap className="h-3 w-3 text-yellow-400" />
    default: return <User className="h-3 w-3 text-indigo-400" />
  }
}

export default function ProfilePage() {
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null)
  const [eventPreferences, setEventPreferences] = useState<{
    preferredExperiences: string[];
    preferredDestinations: string[];
    seasonalPreferences: string[];
    blockedDates: string[];
    generalAvailability: boolean;
  }>({
    preferredExperiences: [],
    preferredDestinations: [],
    seasonalPreferences: [],
    blockedDates: [],
    generalAvailability: true
  })
  const [loading, setLoading] = useState(true)
  const [profileCompletion, setProfileCompletion] = useState(0)
  const router = useRouter()
  const { toast } = useToast()

  // Add these state variables at the top of the ProfilePage component
  const [isEditingExperiences, setIsEditingExperiences] = useState(false)
  const [isEditingDestinations, setIsEditingDestinations] = useState(false)
  const [isEditingSeasons, setIsEditingSeasons] = useState(false)
  const [showDatePicker, setShowDatePicker] = useState(false)
  const [isEditingAvailability, setIsEditingAvailability] = useState(false)
  const [editedExperiences, setEditedExperiences] = useState<string[]>([])
  const [editedDestinations, setEditedDestinations] = useState<string[]>([])
  const [editedSeasons, setEditedSeasons] = useState<string[]>([])
  const [blockedDates, setBlockedDates] = useState<Date[]>([])
  const [travelAvailability, setTravelAvailability] = useState({
    currentYear: true,
    nextYear: true,
    followingYear: true,
  })

  // Add these constants for the preferences options
  const experiencePreferences = [
    { value: "Beginner", label: "Principiante", icon: <Star className="h-4 w-4" /> },
    { value: "Intermediate", label: "Intermedio", icon: <Trophy className="h-4 w-4" /> },
    { value: "Advanced", label: "Avanzado", icon: <Award className="h-4 w-4" /> },
  ]

  const destinationPreferences = [
    { value: "Beach", label: "Playa", icon: <Map className="h-4 w-4" /> },
    { value: "Mountain", label: "Montaña", icon: <Compass className="h-4 w-4" /> },
    { value: "City", label: "Ciudad", icon: <Building className="h-4 w-4" /> },
  ]

  const travelSeasons = [
    { value: "Summer", label: "Verano", icon: <Sun className="h-4 w-4" /> },
    { value: "Winter", label: "Invierno", icon: <Snowflake className="h-4 w-4" /> },
    { value: "Spring", label: "Primavera", icon: <Flower className="h-4 w-4" /> },
    { value: "Autumn", label: "Otoño", icon: <Leaf className="h-4 w-4" /> },
  ]

  // Add these utility functions
  const toggleExperience = (value: string) => {
    setEditedExperiences(prev => 
      prev.includes(value) 
        ? prev.filter(v => v !== value)
        : [...prev, value]
    )
  }

  const toggleDestination = (value: string) => {
    setEditedDestinations(prev => 
      prev.includes(value) 
        ? prev.filter(v => v !== value)
        : [...prev, value]
    )
  }

  const toggleSeason = (value: string) => {
    setEditedSeasons(prev => 
      prev.includes(value) 
        ? prev.filter(v => v !== value)
        : [...prev, value]
    )
  }

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('es-ES', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    })
  }

  const handleSaveExperiences = async () => {
    try {
      // Add your save logic here
      setIsEditingExperiences(false)
    } catch (error) {
      console.error('Error saving experiences:', error)
    }
  }

  const handleSaveDestinations = async () => {
    try {
      // Add your save logic here
      setIsEditingDestinations(false)
    } catch (error) {
      console.error('Error saving destinations:', error)
    }
  }

  const handleSaveSeasons = async () => {
    try {
      // Add your save logic here
      setIsEditingSeasons(false)
    } catch (error) {
      console.error('Error saving seasons:', error)
    }
  }

  const handleSaveBlockedDates = async () => {
    try {
      // Add your save logic here
      setShowDatePicker(false)
    } catch (error) {
      console.error('Error saving blocked dates:', error)
    }
  }

  const handleSaveAvailability = async () => {
    try {
      // Add your save logic here
      setIsEditingAvailability(false)
    } catch (error) {
      console.error('Error saving availability:', error)
    }
  }

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession()

        if (!session?.user) {
          router.push('/login')
          return
        }

        const response = await fetch(`/api/user/${session.user.id}`)
        if (!response.ok) {
          throw new Error('Failed to fetch user data')
        }

        const userData = await response.json()
        setUserProfile(userData.userProfile)
        setEventPreferences(userData.eventPreferences)
        calculateProfileCompletion(userData.userProfile, userData.eventPreferences)
      } catch (error) {
        console.error('Error fetching user data:', error)
        toast({
          title: "Error",
          description: "Failed to fetch your profile data. Please try again.",
          variant: "destructive",
        })
      } finally {
        setLoading(false)
      }
    }

    fetchUserData()
  }, [router, toast])

  const calculateProfileCompletion = (profile: UserProfile | null, preferences: EventPreferences | null) => {
    if (!profile || !preferences) return 0

    const totalFields = 10 // Total number of fields to check
    let completedFields = 0

    // Check profile fields
    if (profile.name) completedFields++
    if (profile.location) completedFields++
    if (profile.languages?.length > 0) completedFields++
    if (profile.personalityTraits?.length > 0) completedFields++
    if (profile.hobbiesAndInterests?.length > 0) completedFields++
    if (profile.goals?.length > 0) completedFields++

    // Check preferences fields
    if (preferences.seasonalPreferences?.length > 0) completedFields++
    if (preferences.categories?.length > 0) completedFields++
    if (preferences.preferredExperiences?.length > 0) completedFields++
    if (preferences.groupSizePreference?.length > 0) completedFields++

    setProfileCompletion((completedFields / totalFields) * 100)
  }

  if (loading) {
    return (
      <div className="flex flex-col gap-4 md:gap-8 p-4 md:p-8">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <Skeleton className="h-10 w-[200px]" />
          <Skeleton className="h-10 w-[150px]" />
        </div>
        <div className="grid grid-cols-1 gap-4 md:gap-6">
          <Skeleton className="h-[300px] w-full" />
          <Skeleton className="h-[300px] w-full" />
          <Skeleton className="h-[300px] w-full" />
        </div>
      </div>
    )
  }

  if (!userProfile) {
    return (
      <div className="flex flex-col gap-4 md:gap-8 p-4 md:p-8">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-white">Perfil no encontrado</h1>
          <p className="text-indigo-200 text-sm md:text-base">Por favor, completa tu registro primero.</p>
        </div>
      </div>
    )
  }

  return (
    <main className="min-h-screen bg-black text-white">
      <div className="container px-4 py-8">
        <h1 className="text-2xl font-bold mb-6 bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent">
          Mi Perfil
        </h1>

        {loading ? (
          <ProfileSkeleton />
        ) : !userProfile ? (
          <div className="p-8 text-center">
            <p className="text-gray-400 mb-4">No se pudo cargar la información del perfil</p>
            <Button onClick={() => window.location.reload()} className="bg-indigo-600 hover:bg-indigo-700">
              Intentar nuevamente
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Columna izquierda - Información principal */}
            <div className="lg:col-span-1 space-y-6">
              {/* Tarjeta de perfil */}
              <Card className="bg-indigo-950/30 border border-indigo-500/30">
                <CardContent className="pt-6">
                  <div className="flex flex-col items-center">
                    <div className="relative group">
                      <Avatar
                        className="h-24 w-24 border-2 border-indigo-500/50 cursor-pointer transition-all hover:scale-105 hover:border-indigo-400 hover:shadow-lg hover:shadow-indigo-500/20"
                        onClick={() => router.push('/profile/edit')}
                      >
                        <AvatarImage src="https://v0.blob.com/GnJpJbRaP.jpeg" alt={userProfile.name} />
                        <AvatarFallback className="bg-indigo-950 text-indigo-200 text-2xl">
                          {userProfile.name
                            .split(" ")
                            .map((n) => n[0])
                            .join("")}
                        </AvatarFallback>
                      </Avatar>
                      <div className="absolute inset-0 flex items-center justify-center bg-indigo-900/40 opacity-0 hover:opacity-100 transition-opacity rounded-full">
                        <Edit2 className="h-8 w-8 text-white" />
                      </div>

                      <Button
                        variant="outline"
                        size="icon"
                        className="absolute bottom-0 right-0 h-8 w-8 rounded-full bg-indigo-950 border border-indigo-500/50"
                      >
                        <Camera size={14} />
                      </Button>
                    </div>

                    <h2 className="mt-4 text-xl font-bold">{userProfile.name}</h2>

                    <div className="mt-4 flex items-center justify-center gap-2">
                      <div className="w-16 h-16 text-right">
                        <CircularProgressbar
                          value={profileCompletion}
                          text={`${Math.round(profileCompletion)}%`}
                          styles={buildStyles({
                            rotation: 0,
                            strokeLinecap: "round",
                            textSize: "24px",
                            pathTransitionDuration: 0.5,
                            pathColor: `rgba(129, 140, 248, ${profileCompletion / 100})`,
                            textColor: "#8b5cf6",
                            trailColor: "rgba(99, 102, 241, 0.1)",
                            backgroundColor: "#3e3e3e"
                          })}
                        />
                      </div>
                      <div className="text-left">
                        <p className="text-xs font-medium text-indigo-400">Perfil completado</p>
                        {profileCompletion < 100 && (
                          <Button
                            variant="link"
                            className="text-xs p-0 h-auto text-indigo-300 hover:text-indigo-200"
                            onClick={() => router.push('/profile/edit')}
                          >
                            ¡Complétalo!
                          </Button>
                        )}
                      </div>
                    </div>

                    <div className="mt-4">
                      <p className="text-sm text-gray-400">Edita tus datos en las pestañas de la derecha</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Tarjeta de estadísticas */}
              <Card className="bg-indigo-950/30 border border-indigo-500/30">
                <CardHeader className="py-3 px-4">
                  <CardTitle className="text-lg flex items-center">
                    <Award className="mr-2 h-5 w-5 text-indigo-400" />
                    Nivel de viajero
                  </CardTitle>
                </CardHeader>
                <CardContent className="py-2 px-4 space-y-4">
                  <div>
                    <div className="flex justify-between mb-1">
                      <span className="text-sm text-gray-400">Nivel de viajero</span>
                      <span className="text-sm text-indigo-300">Plata</span>
                    </div>
                    <Progress
                      value={45}
                      className="h-3 bg-indigo-950/50 rounded-full"
                      style={{
                        backgroundColor: 'rgb(31, 41, 55)',
                        '--progress-indicator-color': 'linear-gradient(to right, rgb(168, 85, 247), rgb(236, 72, 153))'
                      } as React.CSSProperties}
                    />
                    <div className="flex justify-between mt-1 text-xs text-gray-500">
                      <span>Bronce</span>
                      <span>Plata</span>
                      <span>Oro</span>
                      <span>Platino</span>
                    </div>
                    <div className="mt-2 p-2 rounded-lg bg-indigo-950/50 border border-indigo-500/20">
                      <div className="flex items-center mb-1">
                        <Info className="h-3 w-3 text-indigo-400 mr-1" />
                        <span className="text-xs text-indigo-300 font-medium">¿Cómo se calcula mi nivel?</span>
                      </div>
                      <div className="text-[10px] text-gray-400 space-y-1">
                        <p>
                          <span className="text-gray-300">Bronce:</span> 1-3 viajes completados
                        </p>
                        <p>
                          <span className="text-gray-300">Plata:</span> 4-8 viajes completados
                        </p>
                        <p>
                          <span className="text-gray-300">Oro:</span> 9-15 viajes completados
                        </p>
                        <p>
                          <span className="text-gray-300">Platino:</span> Más de 15 viajes completados
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Estadísticas de viaje */}
                  <div className="grid grid-cols-2 gap-3 mt-2">
                    <div className="p-2 rounded-lg bg-indigo-950/50 border border-indigo-500/20">
                      <div className="text-xs text-gray-400">Viajes Arkus</div>
                      <div className="text-lg font-bold">3</div>
                    </div>

                    <div className="p-2 rounded-lg bg-indigo-950/50 border border-indigo-500/20">
                      <div className="text-xs text-gray-400">Viajes Totales</div>
                      <div className="text-lg font-bold">12</div>
                    </div>

                    <div className="p-2 rounded-lg bg-indigo-950/50 border border-indigo-500/20">
                      <div className="text-xs text-gray-400">Días de viaje</div>
                      <div className="text-lg font-bold">45</div>
                    </div>

                    <div className="p-2 rounded-lg bg-indigo-950/50 border border-indigo-500/20">
                      <div className="text-xs text-gray-400">Países visitados</div>
                      <div className="text-lg font-bold">3</div>
                    </div>
                  </div>

                  <div className="p-2 rounded-lg bg-gradient-to-r from-indigo-950/70 to-purple-950/70 border border-indigo-500/30 mt-2">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="text-xs text-gray-400">Próximo viaje</div>
                        <div className="text-sm font-medium text-white mt-1">No hay viajes programados</div>
                      </div>
                      <div className="bg-indigo-600/30 p-1.5 rounded-full">
                        <Plane className="h-4 w-4 text-indigo-300" />
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Botón de cerrar sesión */}
              <Button
                variant="outline"
                className="w-full border-red-500/30 bg-red-950/20 hover:bg-red-500/20 text-red-400 hover:text-red-300 justify-start"
                onClick={() => supabase.auth.signOut()}
              >
                <LogOut size={16} className="mr-2" /> Cerrar sesión
              </Button>
            </div>

            {/* Columna derecha - Contenido principal */}
            <div className="lg:col-span-2">
              <Tabs defaultValue="personal" className="w-full">
                <TabsList className="grid w-full grid-cols-3 bg-transparent border border-indigo-500/30 rounded-xl overflow-hidden">
                  <TabsTrigger
                    value="personal"
                    className="mb-3 data-[state=active]:bg-gradient-to-r data-[state=active]:from-indigo-600/40 data-[state=active]:to-purple-600/40 data-[state=active]:text-white data-[state=active]:shadow-none rounded-none"
                  >
                    Sobre mí
                  </TabsTrigger>
                  <TabsTrigger
                    value="interests"
                    className="mb-3 data-[state=active]:bg-gradient-to-r data-[state=active]:from-indigo-600/40 data-[state=active]:to-purple-600/40 data-[state=active]:text-white data-[state=active]:shadow-none rounded-none"
                  >
                    Intereses
                  </TabsTrigger>
                  <TabsTrigger
                    value="preferences"
                    className="mb-3 data-[state=active]:bg-gradient-to-r data-[state=active]:from-indigo-600/40 data-[state=active]:to-purple-600/40 data-[state=active]:text-white data-[state=active]:shadow-none rounded-none"
                  >
                    Preferencias
                  </TabsTrigger>
                </TabsList>

                {/* Pestaña Sobre mí */}
                <TabsContent value="personal" className="mt-5">
                  <Card className="bg-indigo-950/30 border border-indigo-500/30 mb-4">
                    <CardHeader className="flex flex-row items-center justify-between py-3 px-4">
                      <CardTitle className="text-lg flex items-center">
                        <User className="mr-2 h-5 w-5 text-indigo-400" />
                        Información personal
                      </CardTitle>
                      <Button
                        variant="outline"
                        size="sm"
                        className="border-indigo-500/30 bg-indigo-950/50 hover:bg-indigo-500/20"
                        onClick={() => router.push('/profile/edit')}
                      >
                        <Edit2 size={14} className="mr-2" /> Editar
                      </Button>
                    </CardHeader>
                    <CardContent className="py-2 px-4">
                      <div className="space-y-3">
                        <div className="flex items-center">
                          <User className="h-4 w-4 text-indigo-400 mr-3" />
                          <div>
                            <p className="text-xs text-gray-400">Nombre</p>
                            <p className="text-sm">{userProfile.name}</p>
                          </div>
                        </div>

                        <div className="flex items-center">
                          <MapPin className="h-4 w-4 text-purple-400 mr-3" />
                          <div>
                            <p className="text-xs text-gray-400">Ubicación</p>
                            <p className="text-sm">{userProfile.location}</p>
                          </div>
                        </div>

                        <div className="flex items-center">
                          <Globe className="h-4 w-4 text-indigo-400 mr-3" />
                          <div>
                            <p className="text-xs text-gray-400">Idiomas</p>
                            <div className="flex flex-wrap gap-1 mt-1">
                              {userProfile.languages?.map((language, index) => (
                                <Badge
                                  key={index}
                                  className="bg-indigo-500/10 text-indigo-200 hover:bg-indigo-500/20 transition-colors"
                                >
                                  {language}
                                </Badge>
                              ))}
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center">
                          <Plane className="h-4 w-4 text-purple-400 mr-3" />
                          <div>
                            <p className="text-xs text-gray-400">Aeropuerto más cercano</p>
                            <p className="text-sm">{userProfile.nearestAirport || "No especificado"}</p>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="bg-indigo-950/30 border border-indigo-500/30">
                    <CardHeader className="py-3 px-4">
                      <CardTitle className="text-lg flex items-center">
                        <MapPin className="mr-2 h-5 w-5 text-pink-400" />
                        Destinos visitados recientemente
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="py-2 px-4">
                      <div className="space-y-3">
                        <div className="relative h-[150px] w-full rounded-lg overflow-hidden">
                          <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent"></div>
                          <div className="absolute bottom-2 left-2">
                            <Badge className="bg-indigo-600 mb-1 text-xs">
                              0 destinos
                            </Badge>
                            <div className="flex flex-wrap gap-1 max-w-[250px]">
                              <Badge
                                variant="outline"
                                className="border-indigo-500/30 text-indigo-300 text-[10px]"
                              >
                                No hay destinos registrados
                              </Badge>
                            </div>
                          </div>
                        </div>

                        <div className="space-y-2">
                          <div className="flex justify-between items-center">
                            <h3 className="text-xs font-medium text-gray-300">Últimos destinos visitados</h3>
                            <Button
                              variant="outline"
                              size="sm"
                              className="h-7 text-xs border-indigo-500/30 bg-indigo-950/50 hover:bg-indigo-500/20"
                            >
                              <Plus size={12} className="mr-1" /> Agregar
                            </Button>
                          </div>

                          <div className="p-2 text-center text-gray-400 text-xs">
                            No has registrado destinos visitados
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>

                {/* Pestaña Intereses */}
                <TabsContent value="interests" className="mt-5">
                  <Card className="bg-indigo-950/30 border border-indigo-500/30 mb-4">
                    <CardHeader className="py-3 px-4">
                      <CardTitle className="text-lg flex items-center">
                        <Heart className="mr-2 h-5 w-5 text-indigo-400" />
                        Intereses y hobbies
                      </CardTitle>
                      <CardDescription className="text-xs">
                        Estos son los intereses que seleccionaste durante tu configuración inicial
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="py-2 px-4">
                      <div className="space-y-4">
                        <div>

                          <div className="grid grid-cols-3 md:grid-cols-4 gap-2 mb-4">
                            {userProfile.hobbiesAndInterests?.map((interest) => (
                              <div
                                key={interest}
                                className="flex items-center gap-1.5 p-1.5 rounded-lg bg-indigo-950/50 border border-indigo-500/20"
                              >
                                <div className="flex-shrink-0 w-6 h-6 rounded-full bg-indigo-900/60 flex items-center justify-center">
                                  {getInterestIcon(interest)}
                                </div>
                                <span className="text-xs">{interest}</span>
                              </div>
                            ))}
                            {(!userProfile.hobbiesAndInterests ||
                              userProfile.hobbiesAndInterests.length === 0) && (
                              <div className="col-span-4 p-3 text-center text-gray-400 text-xs">
                                <p>No has seleccionado intereses todavía</p>
                                <Button
                                  variant="link"
                                  className="text-indigo-400 hover:text-indigo-300 mt-1 text-xs"
                                  onClick={() => router.push('/profile/edit')}
                                >
                                  Agregar intereses
                                </Button>
                              </div>
                            )}
                          </div>

                          <div className="flex justify-end items-center mb-2">
                            <Button
                              variant="outline"
                              size="sm"
                              className="h-7 text-xs border-indigo-500/30 bg-indigo-950/50 hover:bg-indigo-500/20"
                              onClick={() => router.push('/profile/edit')}
                            >
                              <Edit2 size={12} className="mr-1" /> Editar
                            </Button>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="bg-indigo-950/30 border border-indigo-500/30 mb-4">
                    <CardHeader className="py-3 px-4">
                      <CardTitle className="text-lg flex items-center">
                        <User className="mr-2 h-5 w-5 text-purple-400" />
                        Rasgos de personalidad
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="py-2 px-4">
                      <div className="space-y-4">
                        <div>
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                            {userProfile.personalityTraits?.map((trait) => (
                              <div
                                key={trait}
                                className="flex items-center gap-1.5 p-1.5 rounded-lg bg-indigo-950/50 border border-indigo-500/20"
                              >
                                <div className="flex-shrink-0 w-6 h-6 rounded-full bg-indigo-900/60 flex items-center justify-center">
                                  {getTraitIcon(trait)}
                                </div>
                                <span className="text-xs">{trait}</span>
                              </div>
                            ))}
                            {(!userProfile.personalityTraits ||
                              userProfile.personalityTraits.length === 0) && (
                              <div className="col-span-4 p-3 text-center text-gray-400 text-xs">
                                <p>No has seleccionado rasgos de personalidad todavía</p>
                                <Button
                                  variant="link"
                                  className="text-indigo-400 hover:text-indigo-300 mt-1 text-xs"
                                  onClick={() => router.push('/profile/edit')}
                                >
                                  Agregar rasgos de personalidad
                                </Button>
                              </div>
                            )}
                          </div>

                          <div className="flex justify-end items-center mb-2">
                            <Button
                              variant="outline"
                              size="sm"
                              className="h-7 text-xs border-indigo-500/30 bg-indigo-950/50 hover:bg-indigo-500/20"
                              onClick={() => router.push('/profile/edit')}
                            >
                              <Edit2 size={12} className="mr-1" /> Editar
                            </Button>
                          </div>

                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>

                {/* Pestaña Preferencias */}
                <TabsContent value="preferences" className="mt-0">
                  <div className="bg-indigo-950/30 border border-indigo-500/30 rounded-lg p-6">
                    <div className="flex items-center gap-2 mb-6">
                      <Plane className="h-5 w-5 text-indigo-400" />
                      <h2 className="text-lg font-medium">Preferencias de viaje</h2>
                    </div>

                    {/* Experiencias preferidas */}
                    <div className="mb-8">
                      <div className="flex justify-between items-center mb-4">
                        <h3 className="text-sm font-medium">Experiencias preferidas</h3>
                        <Button
                          variant="outline"
                          size="sm"
                          className="h-7 text-xs border-indigo-500/30 bg-indigo-950/50 hover:bg-indigo-500/20"
                          onClick={() => setIsEditingExperiences(true)}
                        >
                          <Edit2 size={12} className="mr-1" /> Editar
                        </Button>
                      </div>

                      {isEditingExperiences ? (
                        <div className="space-y-3">
                          <p className="text-xs text-gray-400 mb-1">Selecciona tus experiencias preferidas</p>
                          <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
                            {experiencePreferences.map((exp) => (
                              <div
                                key={exp.value}
                                className={cn(
                                  "flex flex-col items-center justify-center p-2 rounded-lg border cursor-pointer transition-all text-center",
                                  editedExperiences.includes(exp.value)
                                    ? "border-indigo-500 bg-indigo-950/50 text-white"
                                    : "border-indigo-500/30 bg-indigo-950/20 text-gray-300 hover:bg-indigo-950/30",
                                )}
                                onClick={() => toggleExperience(exp.value)}
                              >
                                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-indigo-900/60 flex items-center justify-center mb-1">
                                  {exp.icon}
                                </div>
                                <span className="text-xs">{exp.label}</span>
                              </div>
                            ))}
                          </div>
                          <div className="flex justify-end gap-2 mt-3">
                            <Button
                              variant="outline"
                              size="sm"
                              className="h-7 text-xs border-indigo-500/30 bg-indigo-950/50 hover:bg-indigo-500/20"
                              onClick={() => {
                                setIsEditingExperiences(false)
                                setEditedExperiences([...(eventPreferences?.preferredExperiences || [])])
                              }}
                            >
                              <X size={12} className="mr-1" /> Cancelar
                            </Button>
                            <Button
                              size="sm"
                              className="h-7 text-xs bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700"
                              onClick={handleSaveExperiences}
                            >
                              <Save size={12} className="mr-1" /> Guardar
                            </Button>
                          </div>
                        </div>
                      ) : (
                        <div className="text-center py-6">
                          {eventPreferences?.preferredExperiences?.length > 0 ? (
                            <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
                              {eventPreferences.preferredExperiences.map((exp) => (
                                <div
                                  key={exp}
                                  className="flex flex-col items-center justify-center p-2 rounded-lg bg-indigo-950/50 border border-indigo-500/20 text-center"
                                >
                                  <div className="flex-shrink-0 w-8 h-8 rounded-full bg-indigo-900/60 flex items-center justify-center mb-1">
                                    {getExperienceIcon(exp)}
                                  </div>
                                  <span className="text-xs">{exp}</span>
                                </div>
                              ))}
                            </div>
                          ) : (
                            <>
                              <p className="text-gray-400 text-sm mb-2">No has seleccionado experiencias todavía</p>
                              <Button
                                variant="link"
                                className="text-indigo-400 hover:text-indigo-300 text-xs"
                                onClick={() => setIsEditingExperiences(true)}
                              >
                                Agregar experiencias
                              </Button>
                            </>
                          )}
                        </div>
                      )}
                    </div>

                    {/* Destinos preferidos */}
                    <div className="mb-8">
                      <div className="flex justify-between items-center mb-4">
                        <h3 className="text-sm font-medium">Destinos preferidos</h3>
                        <Button
                          variant="outline"
                          size="sm"
                          className="h-7 text-xs border-indigo-500/30 bg-indigo-950/50 hover:bg-indigo-500/20"
                          onClick={() => setIsEditingDestinations(true)}
                        >
                          <Edit2 size={12} className="mr-1" /> Editar
                        </Button>
                      </div>

                      {isEditingDestinations ? (
                        <div className="space-y-3">
                          <p className="text-xs text-gray-400 mb-1">Selecciona tus destinos preferidos</p>
                          <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
                            {destinationPreferences.map((dest) => (
                              <div
                                key={dest.value}
                                className={cn(
                                  "flex flex-col items-center justify-center p-2 rounded-lg border cursor-pointer transition-all text-center",
                                  editedDestinations.includes(dest.value)
                                    ? "border-indigo-500 bg-indigo-950/50 text-white"
                                    : "border-indigo-500/30 bg-indigo-950/20 text-gray-300 hover:bg-indigo-950/30",
                                )}
                                onClick={() => toggleDestination(dest.value)}
                              >
                                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-indigo-900/60 flex items-center justify-center mb-1">
                                  {dest.icon}
                                </div>
                                <span className="text-xs">{dest.label}</span>
                              </div>
                            ))}
                          </div>
                          <div className="flex justify-end gap-2 mt-3">
                            <Button
                              variant="outline"
                              size="sm"
                              className="h-7 text-xs border-indigo-500/30 bg-indigo-950/50 hover:bg-indigo-500/20"
                              onClick={() => {
                                setIsEditingDestinations(false)
                                setEditedDestinations([...(eventPreferences?.preferredDestinations || [])])
                              }}
                            >
                              <X size={12} className="mr-1" /> Cancelar
                            </Button>
                            <Button
                              size="sm"
                              className="h-7 text-xs bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700"
                              onClick={handleSaveDestinations}
                            >
                              <Save size={12} className="mr-1" /> Guardar
                            </Button>
                          </div>
                        </div>
                      ) : (
                        <div className="text-center py-6">
                          {eventPreferences?.preferredDestinations?.length > 0 ? (
                            <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
                              {eventPreferences.preferredDestinations.map((dest) => (
                                <div
                                  key={dest}
                                  className="flex flex-col items-center justify-center p-2 rounded-lg bg-indigo-950/50 border border-indigo-500/20 text-center"
                                >
                                  <div className="flex-shrink-0 w-8 h-8 rounded-full bg-indigo-900/60 flex items-center justify-center mb-1">
                                    {getDestinationIcon(dest)}
                                  </div>
                                  <span className="text-xs">{dest}</span>
                                </div>
                              ))}
                            </div>
                          ) : (
                            <>
                              <p className="text-gray-400 text-sm mb-2">No has seleccionado destinos todavía</p>
                              <Button
                                variant="link"
                                className="text-indigo-400 hover:text-indigo-300 text-xs"
                                onClick={() => setIsEditingDestinations(true)}
                              >
                                Agregar destinos
                              </Button>
                            </>
                          )}
                        </div>
                      )}
                    </div>

                    {/* Temporadas preferidas */}
                    <div className="mb-8">
                      <div className="flex justify-between items-center mb-4">
                        <h3 className="text-sm font-medium">Temporadas preferidas</h3>
                        <Button
                          variant="outline"
                          size="sm"
                          className="h-7 text-xs border-indigo-500/30 bg-indigo-950/50 hover:bg-indigo-500/20"
                          onClick={() => setIsEditingSeasons(true)}
                        >
                          <Edit2 size={12} className="mr-1" /> Editar
                        </Button>
                      </div>

                      {isEditingSeasons ? (
                        <div className="space-y-3">
                          <p className="text-xs text-gray-400 mb-1">Selecciona tus temporadas preferidas</p>
                          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                            {travelSeasons.map((season) => (
                              <div
                                key={season.value}
                                className={cn(
                                  "flex flex-col items-center justify-center p-2 rounded-lg border cursor-pointer transition-all text-center",
                                  editedSeasons.includes(season.value)
                                    ? "border-indigo-500 bg-indigo-950/50 text-white"
                                    : "border-indigo-500/30 bg-indigo-950/20 text-gray-300 hover:bg-indigo-950/30",
                                )}
                                onClick={() => toggleSeason(season.value)}
                              >
                                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-indigo-900/60 flex items-center justify-center mb-1">
                                  {season.icon}
                                </div>
                                <span className="text-xs">{season.label}</span>
                              </div>
                            ))}
                          </div>
                          <div className="flex justify-end gap-2 mt-3">
                            <Button
                              variant="outline"
                              size="sm"
                              className="h-7 text-xs border-indigo-500/30 bg-indigo-950/50 hover:bg-indigo-500/20"
                              onClick={() => {
                                setIsEditingSeasons(false)
                                setEditedSeasons([...(eventPreferences?.seasonalPreferences || [])])
                              }}
                            >
                              <X size={12} className="mr-1" /> Cancelar
                            </Button>
                            <Button
                              size="sm"
                              className="h-7 text-xs bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700"
                              onClick={handleSaveSeasons}
                            >
                              <Save size={12} className="mr-1" /> Guardar
                            </Button>
                          </div>
                        </div>
                      ) : (
                        <div className="text-center py-6">
                          {eventPreferences?.seasonalPreferences?.length > 0 ? (
                            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                              {eventPreferences.seasonalPreferences.map((season) => (
                                <div
                                  key={season}
                                  className="flex flex-col items-center justify-center p-2 rounded-lg bg-indigo-950/50 border border-indigo-500/20 text-center"
                                >
                                  <div className="flex-shrink-0 w-8 h-8 rounded-full bg-indigo-900/60 flex items-center justify-center mb-1">
                                    {getSeasonIcon(season)}
                                  </div>
                                  <span className="text-xs">{season}</span>
                                </div>
                              ))}
                            </div>
                          ) : (
                            <>
                              <p className="text-gray-400 text-sm mb-2">No has seleccionado temporadas todavía</p>
                              <Button
                                variant="link"
                                className="text-indigo-400 hover:text-indigo-300 text-xs"
                                onClick={() => setIsEditingSeasons(true)}
                              >
                                Agregar temporadas
                              </Button>
                            </>
                          )}
                        </div>
                      )}
                    </div>

                    {/* Fechas bloqueadas */}
                    <div className="mb-8">
                      <div className="flex justify-between items-center mb-4">
                        <h3 className="text-sm font-medium">Fechas bloqueadas</h3>
                        <Button
                          variant="outline"
                          size="sm"
                          className="h-7 text-xs border-indigo-500/30 bg-indigo-950/50 hover:bg-indigo-500/20"
                          onClick={() => setShowDatePicker(true)}
                        >
                          <Calendar size={12} className="mr-1" /> Seleccionar fechas
                        </Button>
                      </div>

                      {showDatePicker ? (
                        <div className="space-y-3">
                          <DatePicker
                            selected={null}
                            onChange={(date) => {
                              if (date && !blockedDates.some(d => d.toDateString() === date.toDateString())) {
                                setBlockedDates([...blockedDates, date])
                              }
                            }}
                            inline
                            highlightDates={blockedDates}
                            className="bg-indigo-950 border-indigo-500/30"
                          />
                          <div className="flex flex-wrap gap-2 mt-2">
                            {blockedDates.map((date, index) => (
                              <Badge
                                key={index}
                                variant="outline"
                                className="flex items-center gap-1 border-indigo-500/30 bg-indigo-950/50"
                              >
                                {formatDate(date)}
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="h-4 w-4 p-0 text-gray-400 hover:text-white hover:bg-transparent"
                                  onClick={() => setBlockedDates(blockedDates.filter((_, i) => i !== index))}
                                >
                                  <X size={12} />
                                </Button>
                              </Badge>
                            ))}
                          </div>
                          <div className="flex justify-end gap-2 mt-3">
                            <Button
                              variant="outline"
                              size="sm"
                              className="h-7 text-xs border-indigo-500/30 bg-indigo-950/50 hover:bg-indigo-500/20"
                              onClick={() => setShowDatePicker(false)}
                            >
                              <X size={12} className="mr-1" /> Cancelar
                            </Button>
                            <Button
                              size="sm"
                              className="h-7 text-xs bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700"
                              onClick={handleSaveBlockedDates}
                            >
                              <Save size={12} className="mr-1" /> Guardar fechas
                            </Button>
                          </div>
                        </div>
                      ) : (
                        <div className="bg-indigo-950/50 border border-indigo-500/20 rounded-lg p-4">
                          <p className="text-xs text-gray-400 mb-2">
                            Fechas en las que no estarás disponible para viajar:
                          </p>
                          {blockedDates.length > 0 ? (
                            <div className="flex flex-wrap gap-2">
                              {blockedDates.map((date, index) => (
                                <Badge
                                  key={index}
                                  variant="outline"
                                  className="border-indigo-500/30 bg-indigo-950/50"
                                >
                                  {formatDate(date)}
                                </Badge>
                              ))}
                            </div>
                          ) : (
                            <p className="text-center text-gray-500 text-sm py-2">
                              No has seleccionado fechas bloqueadas
                            </p>
                          )}
                        </div>
                      )}
                    </div>

                    {/* Disponibilidad general */}
                    <div>
                      <div className="flex justify-between items-center mb-4">
                        <h3 className="text-sm font-medium">Disponibilidad general</h3>
                        <Button
                          variant="outline"
                          size="sm"
                          className="h-7 text-xs border-indigo-500/30 bg-indigo-950/50 hover:bg-indigo-500/20"
                          onClick={() => setIsEditingAvailability(true)}
                        >
                          <Edit2 size={12} className="mr-1" /> Editar
                        </Button>
                      </div>

                      {isEditingAvailability ? (
                        <div className="space-y-3">
                          <p className="text-xs text-gray-400 mb-3">Indica tu disponibilidad general para viajar:</p>
                          <div className="space-y-3">
                            <div className="flex items-center justify-between">
                              <Label htmlFor="currentYear" className="text-sm">
                                {new Date().getFullYear()} (Año actual)
                              </Label>
                              <Switch
                                id="currentYear"
                                checked={travelAvailability.currentYear}
                                onCheckedChange={(checked) =>
                                  setTravelAvailability({ ...travelAvailability, currentYear: checked })
                                }
                              />
                            </div>
                            <div className="flex items-center justify-between">
                              <Label htmlFor="nextYear" className="text-sm">
                                {new Date().getFullYear() + 1} (Próximo año)
                              </Label>
                              <Switch
                                id="nextYear"
                                checked={travelAvailability.nextYear}
                                onCheckedChange={(checked) =>
                                  setTravelAvailability({ ...travelAvailability, nextYear: checked })
                                }
                              />
                            </div>
                            <div className="flex items-center justify-between">
                              <Label htmlFor="followingYear" className="text-sm">
                                {new Date().getFullYear() + 2}
                              </Label>
                              <Switch
                                id="followingYear"
                                checked={travelAvailability.followingYear}
                                onCheckedChange={(checked) =>
                                  setTravelAvailability({ ...travelAvailability, followingYear: checked })
                                }
                              />
                            </div>
                          </div>
                          <div className="flex justify-end gap-2 mt-3">
                            <Button
                              variant="outline"
                              size="sm"
                              className="h-7 text-xs border-indigo-500/30 bg-indigo-950/50 hover:bg-indigo-500/20"
                              onClick={() => {
                                setIsEditingAvailability(false)
                                setTravelAvailability({
                                  currentYear: true,
                                  nextYear: true,
                                  followingYear: true,
                                })
                              }}
                            >
                              <X size={12} className="mr-1" /> Cancelar
                            </Button>
                            <Button
                              size="sm"
                              className="h-7 text-xs bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700"
                              onClick={handleSaveAvailability}
                            >
                              <Save size={12} className="mr-1" /> Guardar
                            </Button>
                          </div>
                        </div>
                      ) : (
                        <div>
                          <p className="text-xs text-gray-400 mb-3">Indica tu disponibilidad general para viajar:</p>
                          <div className="grid grid-cols-3 gap-2">
                            <div className="bg-indigo-950/50 border border-indigo-500/20 rounded-lg p-3 text-center">
                              <p className="text-sm font-medium">{new Date().getFullYear()}</p>
                              <p className="text-xs mt-1 text-indigo-300">
                                {travelAvailability.currentYear ? "Disponible" : "No disponible"}
                              </p>
                            </div>
                            <div className="bg-indigo-950/50 border border-indigo-500/20 rounded-lg p-3 text-center">
                              <p className="text-sm font-medium">{new Date().getFullYear() + 1}</p>
                              <p className="text-xs mt-1 text-indigo-300">
                                {travelAvailability.nextYear ? "Disponible" : "No disponible"}
                              </p>
                            </div>
                            <div className="bg-indigo-950/50 border border-indigo-500/20 rounded-lg p-3 text-center">
                              <p className="text-sm font-medium">{new Date().getFullYear() + 2}</p>
                              <p className="text-xs mt-1 text-indigo-300">
                                {travelAvailability.followingYear ? "Disponible" : "No disponible"}
                              </p>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </TabsContent>
              </Tabs>
            </div>
          </div>
        )}
      </div>

      <style jsx global>{`
        .react-datepicker {
          background-color: rgb(30, 27, 75) !important;
          color: white !important;
          border: 1px solid rgba(99, 102, 241, 0.3) !important;
        }
        
        .react-datepicker__month-container {
          background-color: rgb(30, 27, 75) !important;
        }
        
        .react-datepicker__header {
          background-color: rgb(49, 46, 129) !important;
          border-bottom: 1px solid rgba(99, 102, 241, 0.3) !important;
        }
        
        .react-datepicker__day {
          color: white !important;
        }
        
        .react-datepicker__day:hover {
          background-color: rgba(99, 102, 241, 0.5) !important;
        }
        
        .react-datepicker__day--selected, 
        .react-datepicker__day--keyboard-selected {
          background-color: rgb(99, 102, 241) !important;
          border-radius: 50% !important;
        }
        
        .react-datepicker__day--highlighted {
          background-color: rgba(220, 38, 38, 0.8) !important;
          color: white !important;
          border-radius: 50% !important;
        }
        
        .react-datepicker__day--disabled {
          color: rgba(255, 255, 255, 0.3) !important;
        }
        
        .react-datepicker__navigation-icon::before {
          border-color: rgba(99, 102, 241, 0.8) !important;
        }
        
        .react-datepicker__current-month, 
        .react-datepicker__day-name {
          color: white !important;
        }
      `}</style>
    </main>
  )
} 
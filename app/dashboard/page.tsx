"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { supabase } from "@/lib/supabase"
import { Skeleton } from "@/components/ui/skeleton"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { LogOut, User, Calendar, FileText, Target, RefreshCw, AlertTriangle, Star } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
// Import types from types folder
import { Event } from "@/types"

interface UserData {
  id: string
  userProfile: any
  eventPreferences: any
  restrictions: any
  history: any
  idealOutcomes: any[]
  calendarEvents: any[]
  deliverables: any[]
}

export default function Dashboard() {
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [userData, setUserData] = useState<UserData | null>(null)
  const [refreshing, setRefreshing] = useState(false)
  const [recommendedEvents, setRecommendedEvents] = useState<Event[]>([])
  const [allEvents, setAllEvents] = useState<Event[]>([])
  const [loadingRecommendedEvents, setLoadingRecommendedEvents] = useState(false)
  const [loadingAllEvents, setLoadingAllEvents] = useState(false)
  const router = useRouter()
  const { toast } = useToast()

  // Function to fetch all events
  const fetchAllEvents = async () => {
    try {
      setLoadingAllEvents(true);
      
      // Create mock data as a fallback in case API fails
      const mockEvents = [
        {
          id: "1",
          name: "Tech Conference 2023",
          location: "San Francisco, CA",
          date: "2023-11-15",
          music: ["Ambient", "Electronic"],
          activities: ["Networking", "Workshops", "Presentations"],
          category_name: "Technology"
        },
        {
          id: "2",
          name: "Creative Arts Festival",
          location: "New York, NY",
          date: "2023-12-05",
          music: ["Jazz", "Indie"],
          activities: ["Exhibitions", "Live Performances", "Workshops"],
          category_name: "Arts"
        },
        {
          id: "3",
          name: "Startup Pitch Night",
          location: "Austin, TX",
          date: "2023-10-20",
          music: ["Lofi"],
          activities: ["Pitching", "Networking", "Fundraising"],
          category_name: "Business"
        }
      ];
      
      // Set mock data for now to ensure UI works
      setAllEvents(mockEvents);
      
      // Try to fetch real data in the background if possible
      if (typeof window !== 'undefined') {
        // Use XMLHttpRequest instead of fetch
        const xhr = new XMLHttpRequest();
        xhr.open('GET', '/api/events');
        xhr.setRequestHeader('Content-Type', 'application/json');
        xhr.timeout = 5000; // 5 seconds timeout
        
        xhr.onload = function() {
          if (xhr.status >= 200 && xhr.status < 300) {
            try {
              const data = JSON.parse(xhr.responseText);
              if (data && Array.isArray(data.events) && data.events.length > 0) {
                setAllEvents(data.events);
                console.log(`Loaded ${data.events.length} events from API`);
              }
            } catch (parseError) {
              console.error("Error parsing events data:", parseError);
            }
          }
        };
        
        xhr.onerror = function() {
          console.error("XHR request failed");
        };
        
        xhr.ontimeout = function() {
          console.error("XHR request timed out");
        };
        
        // Send the request
        xhr.send();
      }
    } catch (error) {
      console.error("Error in fetchAllEvents:", error);
    } finally {
      setLoadingAllEvents(false);
    }
  };

  // Function to fetch recommended events from API
  const fetchRecommendedEvents = async (userProfile: any) => {
    try {
      setLoadingRecommendedEvents(true);
      
      // Create mock data as a fallback
      const mockRecommendedEvents = [
        {
          id: "1",
          name: "AI Developers Conference",
          location: "San Francisco, CA",
          date: "2023-12-10",
          music: ["Ambient"],
          activities: ["Coding", "Workshops", "Networking"],
          category_name: "Technology"
        },
        {
          id: "4",
          name: "Digital Marketing Summit",
          location: "Chicago, IL",
          date: "2023-11-28",
          music: ["Lofi", "Jazz"],
          activities: ["Presentations", "Networking", "Case Studies"],
          category_name: "Marketing"
        }
      ];
      
      // Set mock data initially to ensure UI works
      setRecommendedEvents(mockRecommendedEvents);
      
      // Try to fetch real data if possible
      if (typeof window !== 'undefined' && userProfile) {
        // Use XMLHttpRequest instead of fetch
        const xhr = new XMLHttpRequest();
        xhr.open('POST', '/api/recommendations');
        xhr.setRequestHeader('Content-Type', 'application/json');
        xhr.timeout = 5000; // 5 seconds timeout
        
        xhr.onload = function() {
          if (xhr.status >= 200 && xhr.status < 300) {
            try {
              const data = JSON.parse(xhr.responseText);
              if (data && Array.isArray(data.events) && data.events.length > 0) {
                setRecommendedEvents(data.events);
                console.log(`Found ${data.events.length} recommended events from API`);
              }
            } catch (parseError) {
              console.error("Error parsing recommended events data:", parseError);
            }
          }
        };
        
        xhr.onerror = function() {
          console.error("XHR request failed");
        };
        
        xhr.ontimeout = function() {
          console.error("XHR request timed out");
        };
        
        // Send the request with the user profile data
        xhr.send(JSON.stringify({ userProfile }));
      }
    } catch (error) {
      console.error("Error in fetchRecommendedEvents:", error);
    } finally {
      setLoadingRecommendedEvents(false);
    }
  };

  // Function to fetch user profile data
  const fetchUserData = async (userId: string) => {
    try {
      setRefreshing(true);
      console.log(`Fetching user data for ID: ${userId}`);
      
      if (typeof window !== 'undefined' && userId) {
        try {
          // Use a simpler fetch approach
          const response = await fetch(`/api/user/${userId}`, {
            method: 'GET',
            headers: {
              'Content-Type': 'application/json'
            }
          });
          
          console.log(`API response status: ${response.status}`);
          
          if (!response.ok) {
            if (response.status === 404) {
              // User exists in Supabase but profile doesn't exist yet
              console.warn(`User authenticated but profile not found for ID: ${userId}`);
              setUserData(null);
              
              toast({
                title: "Profile Not Found",
                description: "You need to complete the registration process first.",
                variant: "destructive",
              });
            } else {
              const errorText = await response.text();
              console.error(`Failed to fetch user data: ${response.status} - ${errorText}`);
              throw new Error(`Failed to fetch user data: ${response.status} ${errorText}`);
            }
          } else {
            const data = await response.json();
            console.log('Fetched user data:', data);
            
            if (!data.userProfile) {
              console.warn('User data received but no profile found');
              setUserData(null);
              toast({
                title: "Profile Not Found",
                description: "Your profile data is incomplete. Please complete the registration process.",
                variant: "destructive",
              });
            } else {
              setUserData(data);
            }
          }
        } catch (error) {
          console.error('Error fetching user data:', error);
          toast({
            title: "Error",
            description: "Failed to fetch your profile data. Please try again.",
            variant: "destructive",
          });
        }
      }
    } catch (error) {
      console.error('Error in fetchUserData:', error);
    } finally {
      setRefreshing(false);
    }
  };

  // Navigate to registration
  const goToRegistration = () => {
    router.push('/register');
  }

  // Check if user is logged in and fetch their data
  useEffect(() => {
    const checkUser = async () => {
      try {
        setLoading(true)
        const { data: { session } } = await supabase.auth.getSession()
        
        if (!session) {
          router.push('/login')
          return
        }

        // Check if email is confirmed
        if (!session.user.email_confirmed_at) {
          console.log('User email not confirmed:', session.user.email)
          toast({
            title: "Email Not Verified",
            description: "Please check your email and verify your account before accessing the dashboard.",
            variant: "destructive",
          })
          return
        }

        console.log('User authenticated:', session.user.id)
        console.log('Supabase user email:', session.user.email)
        setUser(session.user)
        
        // Fetch user profile data
        await fetchUserData(session.user.id)
      } catch (error) {
        console.error('Error checking authentication:', error)
      } finally {
        setLoading(false)
      }
    }

    checkUser()
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [router])

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    router.push('/login')
  }

  const handleRefresh = () => {
    if (user) {
      fetchUserData(user.id)
    }
  }

  if (loading) {
    return (
      <div className="container max-w-6xl py-10">
        <div className="flex flex-col gap-8">
          <div className="flex justify-between items-center">
            <Skeleton className="h-10 w-[250px]" />
            <Skeleton className="h-10 w-[100px]" />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Skeleton className="h-[300px] w-full" />
            <Skeleton className="h-[300px] w-full" />
            <Skeleton className="h-[300px] w-full" />
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="container max-w-6xl py-10">
      <div className="flex flex-col gap-8">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold">Dashboard</h1>
            <p className="text-muted-foreground">Welcome back, {userData?.userProfile?.name || user?.email}</p>
          </div>
          <div className="flex space-x-2">
            <Button 
              variant="outline" 
              onClick={handleRefresh} 
              disabled={refreshing}
              className="flex items-center"
            >
              <RefreshCw className={`mr-2 h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
              {refreshing ? "Refreshing..." : "Refresh Data"}
            </Button>
            <Button variant="outline" onClick={handleSignOut}>
              <LogOut className="mr-2 h-4 w-4" />
              Sign Out
            </Button>
          </div>
        </div>

        {!userData ? (
          <Card>
            <CardHeader>
              <CardTitle>Profile Not Found</CardTitle>
              <CardDescription>We couldn't find your profile in our database</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="mb-4">
                You're authenticated with Supabase, but it seems you don't have a profile in our database.
                This can happen if:
              </p>
              <ul className="list-disc pl-6 mb-6 space-y-2">
                <li>You signed up but never completed the registration wizard</li>
                <li>You created your account through Supabase directly</li>
                <li>There was an error during the profile creation process</li>
              </ul>
              <p className="mb-4">
                You need to complete the registration process to access your dashboard.
              </p>
              <Button 
                onClick={goToRegistration}
                className="w-full bg-blue-600 text-white hover:bg-blue-700"
              >
                Go to Registration
              </Button>
            </CardContent>
          </Card>
        ) : (
          <Tabs defaultValue="profile" className="w-full">
            <TabsList className="mb-6">
              <TabsTrigger value="profile">
                <User className="mr-2 h-4 w-4" />
                Profile
              </TabsTrigger>
              <TabsTrigger value="recommendations">
                <Star className="mr-2 h-4 w-4" />
                Recommended Events
              </TabsTrigger>
              <TabsTrigger value="preferences">
                <Target className="mr-2 h-4 w-4" />
                Preferences
              </TabsTrigger>
              <TabsTrigger value="calendar">
                <Calendar className="mr-2 h-4 w-4" />
                Calendar
              </TabsTrigger>
              <TabsTrigger value="deliverables">
                <FileText className="mr-2 h-4 w-4" />
                Deliverables
              </TabsTrigger>
            </TabsList>

            <TabsContent value="profile" className="space-y-6">
              {userData?.userProfile ? (
                <>
                  <Card>
                    <CardHeader>
                      <CardTitle>Personal Information</CardTitle>
                      <CardDescription>Your basic profile information</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                          <h3 className="font-medium text-sm text-muted-foreground mb-1">Name</h3>
                          <p className="text-lg">{userData.userProfile.name}</p>
                        </div>
                        <div>
                          <h3 className="font-medium text-sm text-muted-foreground mb-1">Location</h3>
                          <p className="text-lg">{userData.userProfile.location}</p>
                        </div>
                        <div>
                          <h3 className="font-medium text-sm text-muted-foreground mb-1">Current Travel Location</h3>
                          <p className="text-lg">{userData.userProfile.currentTravelLocation || "None specified"}</p>
                        </div>
                        <div>
                          <h3 className="font-medium text-sm text-muted-foreground mb-1">Languages</h3>
                          <div className="flex flex-wrap gap-2 mt-1">
                            {userData.userProfile.languages?.length > 0 ? 
                              userData.userProfile.languages.map((lang: string, i: number) => (
                                <span key={i} className="bg-gray-100 text-gray-800 px-2 py-1 rounded-md text-sm">
                                  {lang}
                                </span>
                              )) : 
                              <p>None specified</p>
                            }
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle>Personality & Goals</CardTitle>
                      <CardDescription>Your traits and objectives</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                          <h3 className="font-medium text-sm text-muted-foreground mb-1">Personality Traits</h3>
                          <div className="flex flex-wrap gap-2 mt-1">
                            {userData.userProfile.personalityTraits?.length > 0 ? 
                              userData.userProfile.personalityTraits.map((trait: string, i: number) => (
                                <span key={i} className="bg-blue-100 text-blue-800 px-2 py-1 rounded-md text-sm">
                                  {trait}
                                </span>
                              )) : 
                              <p>None specified</p>
                            }
                          </div>
                        </div>
                        <div>
                          <h3 className="font-medium text-sm text-muted-foreground mb-1">Goals</h3>
                          <div className="flex flex-wrap gap-2 mt-1">
                            {userData.userProfile.goals?.length > 0 ? 
                              userData.userProfile.goals.map((goal: string, i: number) => (
                                <span key={i} className="bg-green-100 text-green-800 px-2 py-1 rounded-md text-sm">
                                  {goal}
                                </span>
                              )) : 
                              <p>None specified</p>
                            }
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </>
              ) : (
                <Card>
                  <CardHeader>
                    <CardTitle>Profile Incomplete</CardTitle>
                    <CardDescription>Your profile information is not available</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p>You may need to complete the registration process or reload the page.</p>
                  </CardContent>
                </Card>
              )}
            </TabsContent>

            <TabsContent value="recommendations" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Recommended Events</CardTitle>
                  <CardDescription>Events matched to your preferences and profile</CardDescription>
                </CardHeader>
                <CardContent>
                  {loadingRecommendedEvents ? (
                    <div className="space-y-4">
                      <Skeleton className="h-20 w-full" />
                      <Skeleton className="h-20 w-full" />
                      <Skeleton className="h-20 w-full" />
                    </div>
                  ) : recommendedEvents.length > 0 ? (
                    <div className="space-y-4">
                      {recommendedEvents.map((event, index) => (
                        <div key={index} className="border rounded-lg p-4 hover:bg-gray-50 transition-colors">
                          <div className="flex justify-between items-start">
                            <div>
                              <h3 className="font-medium text-lg">{event.name}</h3>
                              <p className="text-sm text-muted-foreground">{event.location} • {event.date}</p>
                            </div>
                          </div>
                          <div className="mt-2">
                            <div className="flex flex-wrap gap-2 mt-1">
                              <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                                Music: {event.music.join(', ')}
                              </span>
                            </div>
                            <div className="flex flex-wrap gap-2 mt-1">
                              {event.activities.map((activity, i) => (
                                <span key={i} className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded">
                                  {activity}
                                </span>
                              ))}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-6">
                      <p className="text-muted-foreground">No recommended events found at this time.</p>
                      <p className="text-sm mt-2">Try updating your preferences or check back later.</p>
                    </div>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>All Events</CardTitle>
                  <CardDescription>Browse all available events</CardDescription>
                </CardHeader>
                <CardContent>
                  {loadingAllEvents ? (
                    <div className="space-y-4">
                      <Skeleton className="h-20 w-full" />
                      <Skeleton className="h-20 w-full" />
                      <Skeleton className="h-20 w-full" />
                    </div>
                  ) : allEvents.length > 0 ? (
                    <div className="space-y-4">
                      {allEvents.map((event, index) => (
                        <div key={index} className="border rounded-lg p-4 hover:bg-gray-50 transition-colors">
                          <div className="flex justify-between items-start">
                            <div>
                              <h3 className="font-medium text-lg">{event.name}</h3>
                              <p className="text-sm text-muted-foreground">
                                {event.location} • {event.date}
                                {event.category_name && <span className="ml-2 text-xs bg-purple-100 text-purple-800 px-2 py-1 rounded">{event.category_name}</span>}
                              </p>
                            </div>
                          </div>
                          <div className="mt-2">
                            <div className="flex flex-wrap gap-2 mt-1">
                              <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                                Music: {event.music.join(', ')}
                              </span>
                            </div>
                            <div className="flex flex-wrap gap-2 mt-1">
                              {event.activities.map((activity, i) => (
                                <span key={i} className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded">
                                  {activity}
                                </span>
                              ))}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-6">
                      <p className="text-muted-foreground">No events available at this time.</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="preferences" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Event Preferences</CardTitle>
                  <CardDescription>Your preferred event types and settings</CardDescription>
                </CardHeader>
                <CardContent>
                  {userData?.eventPreferences ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <h3 className="font-medium text-sm text-muted-foreground mb-1">Categories</h3>
                        <div className="flex flex-wrap gap-2 mt-1">
                          {userData.eventPreferences.categories?.length > 0 ? 
                            userData.eventPreferences.categories.map((cat: string, i: number) => (
                              <span key={i} className="bg-purple-100 text-purple-800 px-2 py-1 rounded-md text-sm">
                                {cat}
                              </span>
                            )) : 
                            <p>None specified</p>
                          }
                        </div>
                      </div>
                      <div>
                        <h3 className="font-medium text-sm text-muted-foreground mb-1">Vibe Keywords</h3>
                        <div className="flex flex-wrap gap-2 mt-1">
                          {userData.eventPreferences.vibeKeywords?.length > 0 ? 
                            userData.eventPreferences.vibeKeywords.map((vibe: string, i: number) => (
                              <span key={i} className="bg-amber-100 text-amber-800 px-2 py-1 rounded-md text-sm">
                                {vibe}
                              </span>
                            )) : 
                            <p>None specified</p>
                          }
                        </div>
                      </div>
                      <div>
                        <h3 className="font-medium text-sm text-muted-foreground mb-1">Budget</h3>
                        <p className="text-lg">{userData.eventPreferences.budget || "Not specified"}</p>
                      </div>
                      <div>
                        <h3 className="font-medium text-sm text-muted-foreground mb-1">Max Distance</h3>
                        <p className="text-lg">{userData.eventPreferences.maxDistanceKm} km</p>
                      </div>
                    </div>
                  ) : (
                    <p className="text-muted-foreground">No event preferences available</p>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Restrictions</CardTitle>
                  <CardDescription>Your event restrictions</CardDescription>
                </CardHeader>
                <CardContent>
                  {userData?.restrictions ? (
                    <div className="grid grid-cols-1 gap-4">
                      <div className="flex items-start">
                        <div className={`w-4 h-4 mt-1 mr-2 rounded-full ${userData.restrictions.avoidCrowdedDaytimeConferences ? 'bg-red-500' : 'bg-gray-300'}`}></div>
                        <div>
                          <h3 className="font-medium">Avoid Crowded Daytime Conferences</h3>
                          <p className="text-sm text-muted-foreground">{userData.restrictions.avoidCrowdedDaytimeConferences ? 'Yes' : 'No'}</p>
                        </div>
                      </div>
                      <div className="flex items-start">
                        <div className={`w-4 h-4 mt-1 mr-2 rounded-full ${userData.restrictions.avoidOverlyFormalNetworking ? 'bg-red-500' : 'bg-gray-300'}`}></div>
                        <div>
                          <h3 className="font-medium">Avoid Overly Formal Networking</h3>
                          <p className="text-sm text-muted-foreground">{userData.restrictions.avoidOverlyFormalNetworking ? 'Yes' : 'No'}</p>
                        </div>
                      </div>
                      <div className="flex items-start">
                        <div className={`w-4 h-4 mt-1 mr-2 rounded-full ${userData.restrictions.avoidFamilyKidsEvents ? 'bg-red-500' : 'bg-gray-300'}`}></div>
                        <div>
                          <h3 className="font-medium">Avoid Family/Kids Events</h3>
                          <p className="text-sm text-muted-foreground">{userData.restrictions.avoidFamilyKidsEvents ? 'Yes' : 'No'}</p>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <p className="text-muted-foreground">No restrictions available</p>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="calendar" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Calendar Events</CardTitle>
                  <CardDescription>Your scheduled events</CardDescription>
                </CardHeader>
                <CardContent>
                  {userData?.calendarEvents && userData.calendarEvents.length > 0 ? (
                    <div className="space-y-4">
                      {userData.calendarEvents.map((event: any, i: number) => (
                        <div key={i} className="border rounded-lg p-4">
                          <div className="flex justify-between items-start">
                            <div>
                              <h3 className="font-medium">{new Date(event.date).toLocaleDateString()}</h3>
                              <p className="text-sm text-muted-foreground">Status: {event.status}</p>
                            </div>
                            <span className={`text-xs px-2 py-1 rounded ${
                              event.status === 'Free' ? 'bg-green-100 text-green-800' : 
                              event.status === 'Booked' ? 'bg-blue-100 text-blue-800' : 
                              'bg-amber-100 text-amber-800'
                            }`}>
                              {event.status}
                            </span>
                          </div>
                          {event.description && (
                            <p className="mt-2">{event.description}</p>
                          )}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-muted-foreground">No calendar events available</p>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="deliverables" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Deliverables</CardTitle>
                  <CardDescription>Your goals and commitments</CardDescription>
                </CardHeader>
                <CardContent>
                  {userData?.deliverables && userData.deliverables.length > 0 ? (
                    <div className="space-y-4">
                      {userData.deliverables.map((deliverable: any, i: number) => (
                        <div key={i} className="border rounded-lg p-4">
                          <div className="flex justify-between items-start">
                            <h3 className="font-medium">{deliverable.title}</h3>
                            <span className="text-xs bg-gray-100 text-gray-800 px-2 py-1 rounded">
                              {new Date(deliverable.date).toLocaleDateString()}
                            </span>
                          </div>
                          {deliverable.note && (
                            <p className="mt-2 text-sm">{deliverable.note}</p>
                          )}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-muted-foreground">No deliverables available</p>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        )}
      </div>
    </div>
  )
} 
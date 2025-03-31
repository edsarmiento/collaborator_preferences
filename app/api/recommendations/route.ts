import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import OpenAI from 'openai'

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
})

export async function POST(request: Request) {
  try {
    const userProfile = await request.json()

    if (!userProfile?.userProfile) {
      return NextResponse.json(
        { success: false, message: 'No user profile provided' },
        { status: 400 }
      )
    }

    if (!userProfile.userProfile.name) {
      return NextResponse.json(
        { success: false, message: 'Invalid user profile data structure' },
        { status: 400 }
      )
    }

    // Fetch all events from the database
    const events = await prisma.event.findMany({
      select: {
        id: true,
        name: true,
        date: true,
        location: true,
        music: true,
        activities: true,
        category: true
      }
    })

    if (!events || events.length === 0) {
      return NextResponse.json({ events: [] })
    }

    // Prepare the prompt for OpenAI
    const prompt = `Given the following user profile and events, recommend the best matches based on preferences and restrictions. Return only a JSON array of event IDs in order of best match to worst match.

User Profile:
${JSON.stringify(userProfile.userProfile, null, 2)}

Event Preferences:
${JSON.stringify(userProfile.eventPreferences, null, 2)}

Restrictions:
${JSON.stringify(userProfile.restrictions, null, 2)}

Available Events:
${JSON.stringify(events, null, 2)}

Return only a JSON array of event IDs in order of best match to worst match. Example: ["event-id-1", "event-id-2", "event-id-3"]`

    // Get recommendations from OpenAI
    const completion = await openai.chat.completions.create({
      model: "gpt-4-turbo-preview",
      messages: [
        {
          role: "system",
          content: "You are an event matching assistant. Your task is to match events to users based on their profile, preferences, and restrictions. Return only a JSON array of event IDs in order of best match to worst match."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      temperature: 0.7,
      max_tokens: 1000
    })

    const content = completion.choices[0].message.content
    let recommendedEventIds: string[] = []

    try {
      recommendedEventIds = JSON.parse(content || '[]')
    } catch (parseError) {
      return NextResponse.json(
        { success: false, message: 'Failed to parse recommendations' },
        { status: 500 }
      )
    }

    // Get the recommended events in order
    const recommendedEvents = recommendedEventIds
      .map(id => events.find(event => event.id === id))
      .filter((event): event is NonNullable<typeof event> => event !== undefined)

    return NextResponse.json({ events: recommendedEvents })
  } catch (error) {
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    )
  }
} 
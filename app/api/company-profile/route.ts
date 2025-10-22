import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

interface CompanyProfile {
  name: string
  description: string
  fundingStage: string
  tone: string
  userName: string
  userPosition: string
}

// GET - Fetch company profile
export async function GET() {
  try {
    // For now, we'll use a default user_id since we don't have auth set up
    // In a real app, you'd get this from the authenticated user
    const userId = '00000000-0000-0000-0000-000000000000'
    
    const { data, error } = await supabase
      .from('company_profiles')
      .select('*')
      .eq('user_id', userId)
      .single()

    if (error && error.code !== 'PGRST116') { // PGRST116 is "not found"
      console.error('Error fetching company profile:', error)
      return Response.json({ error: 'Failed to fetch company profile' }, { status: 500 })
    }

    return Response.json({ 
      success: true, 
      profile: data || null 
    })
  } catch (error) {
    console.error('Company profile fetch error:', error)
    return Response.json({ error: 'Failed to fetch company profile' }, { status: 500 })
  }
}

// POST - Create or update company profile
export async function POST(request: Request) {
  try {
    const body: CompanyProfile = await request.json()
    const { name, description, fundingStage, tone, userName, userPosition } = body

    if (!name || !description || !userName || !userPosition) {
      return Response.json({ error: 'Company name, description, your name, and your position are required' }, { status: 400 })
    }

    // For now, we'll use a default user_id since we don't have auth set up
    const userId = '00000000-0000-0000-0000-000000000000'

    // Check if profile exists
    const { data: existingProfile } = await supabase
      .from('company_profiles')
      .select('id')
      .eq('user_id', userId)
      .single()

    let result
    if (existingProfile) {
      // Update existing profile
      result = await supabase
        .from('company_profiles')
        .update({
          name,
          description,
          funding_stage: fundingStage,
          tone,
          user_name: userName,
          user_position: userPosition,
          updated_at: new Date().toISOString()
        })
        .eq('user_id', userId)
        .select()
        .single()
    } else {
      // Create new profile
      result = await supabase
        .from('company_profiles')
        .insert({
          user_id: userId,
          name,
          description,
          funding_stage: fundingStage,
          tone,
          user_name: userName,
          user_position: userPosition
        })
        .select()
        .single()
    }

    if (result.error) {
      console.error('Error saving company profile:', result.error)
      return Response.json({ error: 'Failed to save company profile' }, { status: 500 })
    }

    return Response.json({ 
      success: true, 
      profile: result.data 
    })
  } catch (error) {
    console.error('Company profile save error:', error)
    return Response.json({ error: 'Failed to save company profile' }, { status: 500 })
  }
}

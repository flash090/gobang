import { createClient } from '@supabase/supabase-js';
import { NextRequest, NextResponse } from 'next/server';

// Initialize Supabase client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabase = createClient(supabaseUrl, supabaseKey);

export async function POST(request: NextRequest) {
  try {
    // Create a new room entry
    const { data, error } = await supabase
      .from('rooms')
      .insert([
        { 
          board: Array(15).fill(Array(15).fill(null)),
          current_player: 'X',
          status: 'waiting',
          moves: [] 
        }
      ])
      .select();

    if (error) {
      console.error('Error creating room:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    const roomId = data[0].id;
    return NextResponse.json({ roomId }, { status: 201 });
  } catch (err) {
    console.error('Unexpected error:', err);
    return NextResponse.json({ error: 'Failed to create room' }, { status: 500 });
  }
} 
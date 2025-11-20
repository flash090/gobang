import { NextRequest, NextResponse } from 'next/server'
import supabase from '@/app/utils/supabase'

export async function POST(request: NextRequest) {
  try {
    const { roomId } = await request.json()

    if (!roomId) {
      return NextResponse.json(
        { error: 'Room ID is required' }, 
        { status: 400 }
      )
    }

    // Check if the room exists
    const { data: roomData, error: roomError } = await supabase
      .from('rooms')
      .select('*')
      .eq('id', roomId)
      .single()

    if (roomError || !roomData) {
      return NextResponse.json(
        { error: 'Room not found' }, 
        { status: 404 }
      )
    }

    // Return room status
    return NextResponse.json({
      roomId: roomData.id,
      board: roomData.board,
      currentPlayer: roomData.current_player,
      status: roomData.status
    })
  } catch (error) {
    console.error('Error joining room:', error)
    return NextResponse.json(
      { error: 'Failed to join room' }, 
      { status: 500 }
    )
  }
} 
import { NextRequest, NextResponse } from 'next/server'
import supabase from '@/app/utils/supabase'

export async function POST(request: NextRequest) {
  try {
    const { roomId, x, y, player } = await request.json()

    // Validation
    if (!roomId || x === undefined || y === undefined || !player) {
      return NextResponse.json(
        { error: 'Missing required fields' }, 
        { status: 400 }
      )
    }

    // Get the current room state
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

    // Check if it's the player's turn
    if (roomData.current_player !== player) {
      return NextResponse.json(
        { error: 'Not your turn' }, 
        { status: 400 }
      )
    }

    // Check if the position is valid
    const board = roomData.board
    if (board[y][x] !== null) {
      return NextResponse.json(
        { error: 'Invalid move, position already occupied' }, 
        { status: 400 }
      )
    }

    // Make the move
    const newBoard = [...board]
    newBoard[y][x] = player

    // Switch the current player
    const nextPlayer = player === 'X' ? 'O' : 'X'

    // Update the room
    const { error: updateError } = await supabase
      .from('rooms')
      .update({ 
        board: newBoard, 
        current_player: nextPlayer,
        last_move: { x, y, player }
      })
      .eq('id', roomId)

    if (updateError) {
      return NextResponse.json(
        { error: updateError.message }, 
        { status: 500 }
      )
    }

    return NextResponse.json({ 
      success: true,
      board: newBoard,
      currentPlayer: nextPlayer
    })
  } catch (error) {
    console.error('Error making move:', error)
    return NextResponse.json(
      { error: 'Failed to make move' }, 
      { status: 500 }
    )
  }
} 
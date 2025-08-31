import { db } from "@/app/config/firebase";
import { get, ref, update } from "firebase/database";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req:NextRequest) {
try{
   const body = await req.json();
   const {username , roomId} = body;
   if(!username || username.trim() === "" || !roomId || roomId.trim() === "" ){
    return NextResponse.json({
        message:"enter the values",
    })
   }
   const roomRef = ref(db, `rooms/${roomId}`)
   const snapshot = await get(roomRef);
   if(!snapshot.exists()){
    return NextResponse.json({
        error: "Room not found"
    })
   }

const roomData = snapshot.val();
   if (roomData.players && roomData.players[username]) {
      return NextResponse.json(
        { error: "Username already taken in this room" },
        { status: 400 }
      );
    }
    await update(roomRef,{
        players:{
            ...roomData.players,
            [username]:{score: 0, selectedSongs:[]},
        }

    })
      return NextResponse.json(
      {
        message: "Joined room successfully",
        roomId,
        players: {
          ...roomData.players,
          [username]: { score: 0,selectedSongs: [] },
        },
      },
      { status: 200 }
    );

}   
catch(error:any){
 return NextResponse.json(
      {
        error: "Internal Server Error",
        details: error.message,
      },
      { status: 500 }
    );
} 
    
}
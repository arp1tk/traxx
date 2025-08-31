import { db } from "@/app/config/firebase";
import { error } from "console";
import { get, ref } from "firebase/database";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req:NextRequest,
    {params}:{params:{roomId: string}}
){
    try{
        const {roomId} =await params;
    if(!roomId){
        return NextResponse.json({
            error:"no room id"
        })
    }
    const roomRef = ref(db , `rooms/${roomId}`)
    const snapshot = await get(roomRef);
    if(!snapshot.exists()){
        return NextResponse.json({
            error:"room not found"
        })
    }
    return NextResponse.json({
        message:"fetched successfully",
        room: snapshot.val()
    })
}
catch(error:any){
    return NextResponse.json({
        details: error.message
    })
}
}
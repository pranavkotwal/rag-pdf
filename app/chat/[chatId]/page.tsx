import { db } from '@/lib/db';
import { auth } from '@clerk/nextjs';
import { redirect } from 'next/navigation';
import React from 'react'
import { chats } from '@/lib/db/schema';
import { eq } from "drizzle-orm";
type Props = {
    params:{
        chatId:string;
    }
    
}

const ChatPage = async ({params:{chatId}}:Props)=>{
    const {userId} = await auth()
    if(!userId){
        return redirect('/sign-in')
    }
    const _chats = await db.select().from(chats).where(eq(chats.userId, userId));
    if(!_chats){
        return redirect('/')
    }
    if (!_chats.find((chat) => chat.id === parseInt(chatId))) {
    return redirect("/");
  }
    return (
        <div className='flex max-h-screen overflow-scroll' > 
            <div className="flex w-full max-h-screen overflow-scroll">
                {/* {chatSidebar} */}
                <div className='flex-[1] max-w-xs'>
                    

                </div>
                {/* pdfviewer */}
                <div></div>
                {/* {chat component} */}
                <div></div>
            </div>

        </div>
    )
}
export default ChatPage
'use client'
import { DrizzleChat } from '@/lib/db/schema'
import Link from 'next/link'
import React from 'react'
import { Button } from './button'
import { PlusCircleIcon } from 'lucide-react'

type Props ={
    chats:DrizzleChat[],
    chatId:number,
}

export const ChatSideBar = ({chats,chatId}: Props) => {
    return (
        <div className='w-full h-screen p-4 text-gray-200 bg-gray-900'>
            <Link href='/'>
                <Button>
                    <PlusCircleIcon className='mr-2 w-4 h-4' />
                    New Chat
                </Button>
            </Link>
        </div>
    )
}

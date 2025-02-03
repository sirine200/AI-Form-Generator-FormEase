import React from 'react'
import { auth, signIn, signOut } from "@/auth";
import { Button } from './button';
import Image from 'next/image';
import Link from 'next/link';



type Props = {}

function SignOut() {
  return (
    <form action={async () => {
      'use server';
      await signOut()
    }}>
      <Button type="submit">Sign out</Button>
    </form>
  )
}

const Header = async (props: Props) => {
  const session = await auth();

  return (
    <header className='border bottom-1'><nav className='bg-white border-gray-200 px-4 py-2.5'>
      <div className='flex flex-wrap justify-between items-center mx-auto max-w-screen-xl'><div className='flex items-center space-x-2'><a href='/'><img src="images/app/kitty.png" alt="logo" width={70} height='auto'/></a><a href='/'><h1 className="text-3xl font-bold text-black bg-gradient-to-r from-silver-400 via-silver-500 to-silver-600 bg-clip-text">FormEase</h1></a></div><div>
        {
          session?.user ? (
            <div className="flex items-center gap-4">
              <Link href="/view-forms">
                <Button variant="outline">Dashboard</Button></Link>
              {session.user.name && session.user.image &&
                <Image
                  src={session.user.image}
                  alt={session.user.name}
                  width={32}
                  height={32}
                  className='rounded-full' />
              }
              <SignOut />
            </div>
          ) : (
            <Link href="/api/auth/signin"><Button variant="link">Sign in</Button></Link>
          )
        }</div></div>
    </nav></header>
  )
}

export default Header
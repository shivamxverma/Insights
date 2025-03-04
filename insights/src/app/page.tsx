import { Button } from '@/components/ui/button'
import Link from 'next/link'
import React from 'react'

const Home = () => {
  return (
    <div className='px-40 mt-40 justify-center h-screen'>
        goto dashboard
        <br/>
        <Link href="/dashboard">
        <Button> dashboard</Button>
        </Link>
    </div>
  )
}

export default Home
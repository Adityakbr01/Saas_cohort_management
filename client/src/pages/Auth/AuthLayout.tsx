import { Button } from '@/components/ui/button'
import { ArrowLeft } from 'lucide-react'
import React from 'react'
import { Link } from 'react-router-dom'

function AuthLayout({ children }: { children: React.ReactNode }) {
    return (
        <div className="min-h-screen w-full flex flex-col justify-between bg-background">
            <Button className='p-4 absolute top-4 left-4  cursor-pointer' variant={"outline"}>
                <ArrowLeft className="h-4 w-4" />
                Back
            </Button>


            <div className='flex w-full max-w-sm flex-col gap-8'>
                <Link to={"/"}>
                    EduLaunch
                </Link>
                {
                    children
                }
                
            </div>

        </div>
    )
}

export default AuthLayout
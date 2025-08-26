'use client'

import { useSession, signOut } from 'next-auth/react'
import { Button } from './ui/button'
import { LogOut, User } from 'lucide-react'

export function Header() {
  const { data: session } = useSession()

  return (
    <header className="bg-white shadow-sm border-b px-6 py-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-gray-900">
            Dashboard - AgentsFood
          </h1>
          {(session?.user as any)?.establishment && (
            <p className="text-sm text-gray-600">
              {(session?.user as any)?.establishment?.name}
            </p>
          )}
        </div>
        
        <div className="flex items-center space-x-4">
          {session?.user && (
            <div className="flex items-center space-x-3">
              <div className="flex items-center space-x-2">
                <User className="h-4 w-4 text-gray-600" />
                <span className="text-sm text-gray-700">
                  {session.user.name || session.user.email}
                </span>
              </div>
              
              <Button
                variant="outline"
                size="sm"
                onClick={() => signOut({ callbackUrl: '/auth/signin' })}
                className="flex items-center space-x-2"
              >
                <LogOut className="h-4 w-4" />
                <span>Sair</span>
              </Button>
            </div>
          )}
        </div>
      </div>
    </header>
  )
}
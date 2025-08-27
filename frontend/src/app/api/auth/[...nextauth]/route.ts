import NextAuth from 'next-auth'
import CredentialsProvider from 'next-auth/providers/credentials'
import { JWT } from 'next-auth/jwt'

// Tipos personalizados para resolver o erro de TypeScript
interface CustomUser {
  id: string
  email: string
  name: string
  accessToken: string
  establishment: any
}

interface CustomToken extends JWT {
  accessToken?: string
  establishment?: any
}

const handler = NextAuth({
  providers: [
    CredentialsProvider({
      name: 'credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' }
      },
      async authorize(credentials): Promise<CustomUser | null> {
        if (!credentials?.email || !credentials?.password) {
          return null
        }

        try {
          // Detectar ambiente automaticamente
          const getBackendUrl = () => {
            // Se estiver rodando no Vercel (produção)
            if (process.env.VERCEL === '1') {
              return 'https://agentsfood-production.up.railway.app'
            }
            
            // Se estiver rodando localmente (desenvolvimento)
            return 'http://localhost:3001'
          }
          
          const backendUrl = getBackendUrl()
          const response = await fetch(`${backendUrl}/api/auth/login`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              email: credentials.email,
              password: credentials.password,
            }),
          })

          if (!response.ok) {
            return null
          }

          const data = await response.json()
          
          return {
            id: data.user.id,
            email: data.user.email,
            name: data.user.name,
            accessToken: data.access_token,
            establishment: data.user.establishment,
          }
        } catch (error) {
          console.error('Authentication error:', error)
          return null
        }
      }
    })
  ],
  callbacks: {
    async jwt({ token, user }): Promise<CustomToken> {
      if (user) {
        token.accessToken = (user as CustomUser).accessToken
        token.establishment = (user as CustomUser).establishment
      }
      return token
    },
    async session({ session, token }: { session: any, token: CustomToken }) {
      session.accessToken = token.accessToken
      session.user.establishment = token.establishment
      return session
    },
  },
  pages: {
    signIn: '/auth/signin',
  },
  session: {
    strategy: 'jwt',
    maxAge: 7 * 24 * 60 * 60, // 7 dias em segundos
  },
  jwt: {
    maxAge: 7 * 24 * 60 * 60, // 7 dias em segundos
  },
  secret: process.env.NEXTAUTH_SECRET,
})

export { handler as GET, handler as POST }
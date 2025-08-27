import { getServerSession } from 'next-auth/next'
import { NextAuthOptions } from 'next-auth'
import CredentialsProvider from 'next-auth/providers/credentials'

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: 'credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          console.log('❌ Credenciais faltando:', { email: !!credentials?.email, password: !!credentials?.password })
          return null
        }

        try {
          // URL do backend - sempre usar Railway em produção
          const backendUrl = 'https://agentsfood-production.up.railway.app'
          console.log('🌐 Tentando autenticar com:', backendUrl)
          
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

          console.log('📡 Resposta do backend:', response.status, response.statusText)

          if (!response.ok) {
            const errorText = await response.text()
            console.log('❌ Erro na resposta:', errorText)
            return null
          }

          const data = await response.json()
          console.log('✅ Login bem-sucedido:', { userId: data.user.id, email: data.user.email })
          
          return {
            id: data.user.id,
            email: data.user.email,
            name: data.user.name,
            accessToken: data.access_token,
            establishment: data.user.establishment,
          }
        } catch (error) {
          console.error('❌ Erro na autenticação:', error)
          return null
        }
      }
    })
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.accessToken = (user as any).accessToken
        token.establishment = (user as any).establishment
      }
      return token
    },
    async session({ session, token }: { session: any, token: any }) {
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
}

export const getServerAuthSession = () => getServerSession(authOptions)
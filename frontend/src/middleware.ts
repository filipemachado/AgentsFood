

















































import { withAuth } from "next-auth/middleware"

export default withAuth(
  function middleware(req) {
    // Middleware adicional pode ser implementado aqui
    console.log('Middleware executado para:', req.nextUrl.pathname)
  },
  {
    callbacks: {
      authorized: ({ token }) => !!token
    },
  }
)

export const config = {
  matcher: ['/dashboard/:path*']
}
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { getToken } from 'next-auth/jwt';


const protectedPrefixes = ['/dashboard', '/api/customers'];


export async function middleware(req: NextRequest) {
const { pathname } = req.nextUrl;
const isProtected = protectedPrefixes.some((p) => pathname.startsWith(p));
if (!isProtected) return NextResponse.next();


const token = await getToken({ req });
if (!token) {
const url = new URL('/login', req.url);
url.searchParams.set('callbackUrl', pathname);
return NextResponse.redirect(url);
}
return NextResponse.next();
}


export const config = { matcher: ['/dashboard/:path*', '/api/customers/:path*'] };
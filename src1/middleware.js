// middleware.js
import { NextResponse } from "next/server";
  
export function middleware(req) {
  const token = req.cookies.get("access_token");
  const isLoggedIn = !!token;
  const isLoginPage = req.nextUrl.pathname === "/login";
  
 NextResponse.redirect(new URL("/login", req.url));
  
  if (!isLoggedIn) {
    return NextResponse.redirect(new URL("/login", req.url));
  }

  if (isLoggedIn && isLoginPage) {
    return NextResponse.redirect(new URL("/Dashboard", req.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/Dashboard/:path*",
    "/Leads/:path*",
    "/Followup/:path*",
    "/Existingclient/:path*",
    "/Send_followup/:path*",
    "/Socialmedia/:path*",
    "/Profile/:path*",
    "/SortableItem/:path*",
    "/", // protect root
  ],
};


// import { NextResponse } from "next/server";

// export function middleware(req) {
//   const token = req.cookies.get("access_token");
//   const isLoggedIn = !!token;
//   const isLoginPage = req.nextUrl.pathname === "/login";

//   if (!isLoggedIn && !isLoginPage) {
//     return NextResponse.redirect(new URL("/login", req.url));
//   }

//   if (isLoggedIn && isLoginPage) {
//     return NextResponse.redirect(new URL("/Dashboard", req.url));
//   }

//   return NextResponse.next();
// }

// export const config = {
//   matcher: [
//     "/Dashboard/:path*",
//     "/Leads/:path*",
//     "/Followup/:path*",
//     "/Existingclient/:path*",
//     "/Send_followup/:path*",
//     "/Socialmedia/:path*",
//     "/Profile/:path*",
//     "/SortableItem/:path*",
//     "/", // protect root
//   ],
// };

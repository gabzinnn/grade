import { NextResponse, type NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Rotas públicas — deixa passar sempre
  if (pathname.startsWith("/login")) return NextResponse.next();

  // Todas as outras rotas exigem o cookie de sessão
  const perfilId = request.cookies.get("perfil_id")?.value;
  if (!perfilId) {
    const loginUrl = request.nextUrl.clone();
    loginUrl.pathname = "/login";
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    // Exclui arquivos estáticos, assets e rotas de API do Next internos
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};

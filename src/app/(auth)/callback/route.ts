import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get('code');
  const next = searchParams.get('next') ?? '/home';
  const error_description = searchParams.get('error_description');

  // Si hay un error de OAuth, redirigir al login con el mensaje
  if (error_description) {
    console.error('OAuth error:', error_description);
    return NextResponse.redirect(`${origin}/login?error=${encodeURIComponent(error_description)}`);
  }

  if (code) {
    const cookieStore = await cookies();

    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            return cookieStore.getAll();
          },
          setAll(cookiesToSet) {
            try {
              cookiesToSet.forEach(({ name, value, options }) =>
                cookieStore.set(name, value, options)
              );
            } catch (error) {
              // Ignorar errores de cookies en Server Components
            }
          },
        },
      }
    );

    const { error } = await supabase.auth.exchangeCodeForSession(code);

    if (error) {
      console.error('Error exchanging code for session:', error.message);
      return NextResponse.redirect(`${origin}/login?error=${encodeURIComponent(error.message)}`);
    }

    // Redirigir al home después de login exitoso
    const redirectUrl = new URL(next, origin);
    return NextResponse.redirect(redirectUrl);
  }

  // No hay código, redirigir al login
  return NextResponse.redirect(`${origin}/login?error=no_code`);
}

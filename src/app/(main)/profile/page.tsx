'use client';

import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import {
  User,
  Mail,
  Crown,
  LogOut,
  Settings,
  ChevronRight,
  Moon,
  Sun,
  Smartphone,
} from 'lucide-react';
import Link from 'next/link';
import { useTheme } from '@/contexts/ThemeContext';

export default function ProfilePage() {
  const { user, profile, signOut, updateProfile } = useAuth();
  const { theme, setTheme } = useTheme();
  const [isEditing, setIsEditing] = useState(false);
  const [fullName, setFullName] = useState(profile?.full_name || '');
  const [isUpdating, setIsUpdating] = useState(false);

  const handleUpdateProfile = async () => {
    if (!fullName.trim()) return;

    setIsUpdating(true);
    await updateProfile({ full_name: fullName.trim() });
    setIsUpdating(false);
    setIsEditing(false);
  };

  const getInitials = () => {
    if (profile?.full_name) {
      return profile.full_name
        .split(' ')
        .map((n) => n[0])
        .join('')
        .toUpperCase()
        .slice(0, 2);
    }
    return user?.email?.[0].toUpperCase() || 'U';
  };

  const getRoleBadge = () => {
    switch (profile?.role) {
      case 'admin':
        return (
          <Badge variant="destructive" className="gap-1">
            <Crown className="h-3 w-3" />
            Admin
          </Badge>
        );
      case 'premium':
        return (
          <Badge className="bg-yellow-500 text-yellow-950 gap-1">
            <Crown className="h-3 w-3" />
            Premium
          </Badge>
        );
      default:
        return <Badge variant="secondary">Free</Badge>;
    }
  };

  return (
    <div className="space-y-6 p-6 max-w-2xl mx-auto">
      <h1 className="text-3xl font-bold">Mi Perfil</h1>

      {/* Profile Card */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-4">
            <Avatar className="h-20 w-20">
              <AvatarImage src={profile?.avatar_url || undefined} />
              <AvatarFallback className="text-2xl">{getInitials()}</AvatarFallback>
            </Avatar>
            <div className="flex-1">
              {isEditing ? (
                <div className="space-y-2">
                  <Input
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="Tu nombre"
                  />
                  <div className="flex gap-2">
                    <Button size="sm" onClick={handleUpdateProfile} disabled={isUpdating}>
                      {isUpdating ? 'Guardando...' : 'Guardar'}
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => setIsEditing(false)}
                    >
                      Cancelar
                    </Button>
                  </div>
                </div>
              ) : (
                <>
                  <div className="flex items-center gap-2">
                    <CardTitle>{profile?.full_name || 'Sin nombre'}</CardTitle>
                    {getRoleBadge()}
                  </div>
                  <CardDescription className="flex items-center gap-1 mt-1">
                    <Mail className="h-3 w-3" />
                    {user?.email}
                  </CardDescription>
                  <Button
                    variant="link"
                    className="p-0 h-auto text-sm"
                    onClick={() => setIsEditing(true)}
                  >
                    Editar perfil
                  </Button>
                </>
              )}
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Premium Upgrade */}
      {profile?.role === 'user' && (
        <Card className="bg-gradient-to-r from-yellow-500/10 to-orange-500/10 border-yellow-500/20">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <Crown className="h-5 w-5 text-yellow-500" />
                  Hazte Premium
                </CardTitle>
                <CardDescription>
                  Desbloquea todo el contenido y descarga para escuchar offline
                </CardDescription>
              </div>
              <Link href="/premium">
                <Button className="bg-yellow-500 hover:bg-yellow-600 text-yellow-950">
                  Actualizar
                </Button>
              </Link>
            </div>
          </CardHeader>
        </Card>
      )}

      {/* Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            Configuración
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Theme */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              {theme === 'dark' ? (
                <Moon className="h-5 w-5" />
              ) : (
                <Sun className="h-5 w-5" />
              )}
              <div>
                <p className="font-medium">Tema</p>
                <p className="text-sm text-muted-foreground">
                  {theme === 'dark' ? 'Oscuro' : theme === 'light' ? 'Claro' : 'Sistema'}
                </p>
              </div>
            </div>
            <div className="flex gap-1">
              <Button
                variant={theme === 'light' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setTheme('light')}
              >
                <Sun className="h-4 w-4" />
              </Button>
              <Button
                variant={theme === 'dark' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setTheme('dark')}
              >
                <Moon className="h-4 w-4" />
              </Button>
              <Button
                variant={theme === 'system' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setTheme('system')}
              >
                <Smartphone className="h-4 w-4" />
              </Button>
            </div>
          </div>

          <Separator />

          {/* Admin Link */}
          {profile?.role === 'admin' && (
            <>
              <Link
                href="/admin"
                className="flex items-center justify-between py-2 hover:bg-accent rounded-lg px-2 -mx-2 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <Settings className="h-5 w-5" />
                  <div>
                    <p className="font-medium">Panel de Administración</p>
                    <p className="text-sm text-muted-foreground">
                      Gestionar contenido y usuarios
                    </p>
                  </div>
                </div>
                <ChevronRight className="h-5 w-5 text-muted-foreground" />
              </Link>
              <Separator />
            </>
          )}

          {/* Sign Out */}
          <Button
            variant="destructive"
            className="w-full"
            onClick={signOut}
          >
            <LogOut className="h-4 w-4 mr-2" />
            Cerrar sesión
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}

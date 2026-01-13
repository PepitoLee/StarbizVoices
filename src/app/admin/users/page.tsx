'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Search, MoreVertical, Crown, User, Shield } from 'lucide-react';
import type { Profile } from '@/types';

export default function UsersPage() {
  const [users, setUsers] = useState<Profile[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<Profile[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('all');
  const supabase = createClient();

  useEffect(() => {
    fetchUsers();
  }, []);

  useEffect(() => {
    let result = users;

    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter(
        (user) =>
          user.full_name?.toLowerCase().includes(query) ||
          user.id.toLowerCase().includes(query)
      );
    }

    if (roleFilter !== 'all') {
      result = result.filter((user) => user.role === roleFilter);
    }

    setFilteredUsers(result);
  }, [users, searchQuery, roleFilter]);

  async function fetchUsers() {
    const { data } = await supabase
      .from('profiles')
      .select('*')
      .order('created_at', { ascending: false });
    setUsers(data || []);
    setFilteredUsers(data || []);
    setIsLoading(false);
  }

  const updateUserRole = async (userId: string, newRole: 'user' | 'premium' | 'admin') => {
    await supabase.from('profiles').update({ role: newRole }).eq('id', userId);
    fetchUsers();
  };

  const getRoleBadge = (role: string) => {
    switch (role) {
      case 'admin':
        return (
          <Badge variant="destructive" className="gap-1">
            <Shield className="h-3 w-3" />
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
        return (
          <Badge variant="secondary" className="gap-1">
            <User className="h-3 w-3" />
            Free
          </Badge>
        );
    }
  };

  const getInitials = (name: string | null) => {
    if (!name) return 'U';
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin h-8 w-8 border-2 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Usuarios</h1>
        <p className="text-muted-foreground">Gestiona los usuarios de la plataforma</p>
      </div>

      {/* Filters */}
      <div className="flex gap-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar por nombre..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
          />
        </div>
        <Select value={roleFilter} onValueChange={setRoleFilter}>
          <SelectTrigger className="w-40">
            <SelectValue placeholder="Filtrar por rol" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos</SelectItem>
            <SelectItem value="user">Free</SelectItem>
            <SelectItem value="premium">Premium</SelectItem>
            <SelectItem value="admin">Admin</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        <div className="p-4 rounded-lg bg-card border">
          <p className="text-sm text-muted-foreground">Total usuarios</p>
          <p className="text-2xl font-bold">{users.length}</p>
        </div>
        <div className="p-4 rounded-lg bg-card border">
          <p className="text-sm text-muted-foreground">Premium</p>
          <p className="text-2xl font-bold text-yellow-500">
            {users.filter((u) => u.role === 'premium').length}
          </p>
        </div>
        <div className="p-4 rounded-lg bg-card border">
          <p className="text-sm text-muted-foreground">Admins</p>
          <p className="text-2xl font-bold text-red-500">
            {users.filter((u) => u.role === 'admin').length}
          </p>
        </div>
      </div>

      {/* Users Table */}
      <div className="border rounded-lg">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Usuario</TableHead>
              <TableHead>Rol</TableHead>
              <TableHead>Registrado</TableHead>
              <TableHead className="w-16">Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredUsers.map((user) => (
              <TableRow key={user.id}>
                <TableCell>
                  <div className="flex items-center gap-3">
                    <Avatar>
                      <AvatarImage src={user.avatar_url || undefined} />
                      <AvatarFallback>{getInitials(user.full_name)}</AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-medium">{user.full_name || 'Sin nombre'}</p>
                      <p className="text-sm text-muted-foreground truncate max-w-[200px]">
                        {user.id}
                      </p>
                    </div>
                  </div>
                </TableCell>
                <TableCell>{getRoleBadge(user.role)}</TableCell>
                <TableCell className="text-muted-foreground">
                  {new Date(user.created_at).toLocaleDateString('es-ES')}
                </TableCell>
                <TableCell>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon">
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem
                        onClick={() => updateUserRole(user.id, 'user')}
                        disabled={user.role === 'user'}
                      >
                        <User className="h-4 w-4 mr-2" />
                        Hacer Free
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => updateUserRole(user.id, 'premium')}
                        disabled={user.role === 'premium'}
                      >
                        <Crown className="h-4 w-4 mr-2" />
                        Hacer Premium
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => updateUserRole(user.id, 'admin')}
                        disabled={user.role === 'admin'}
                      >
                        <Shield className="h-4 w-4 mr-2" />
                        Hacer Admin
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {filteredUsers.length === 0 && (
        <div className="text-center py-12 text-muted-foreground">
          No se encontraron usuarios con los filtros aplicados.
        </div>
      )}
    </div>
  );
}

import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
 
import { UsersService } from '../../services/users.service';
import { ToastService } from '../../services/toast.service';
import { UserProfile } from '../../models/user.model';
import { Role } from '../../models/auth.model';
 
const ROLES: Role[] = ['Ciudadano', 'Tecnico', 'Administrador'];
 
@Component({
  selector: 'app-users-admin',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './users-admin.html',
  styleUrl: './users-admin.css',
  styles: [`
    .users-admin { display: flex; flex-direction: column; gap: 1rem; }
    .filtro { display: flex; flex-direction: column; gap: 0.35rem; max-width: 220px; font-size: 0.9rem; }
    table { width: 100%; border-collapse: collapse; }
    th, td { text-align: left; padding: 0.5rem; border-bottom: 1px solid #ddd; }
    .form-error { color: #b3261e; }
    .aviso { font-size: 0.85rem; color: #555; }
  `],
})
export class UsersAdminComponent implements OnInit {
  private readonly usersService = inject(UsersService);
  private readonly toastService = inject(ToastService);
 
  readonly roles = ROLES;
  readonly rolFiltro = signal<string>('');
  readonly usuarios = signal<UserProfile[]>([]);
  readonly loading = signal(true);
  readonly error = signal<string | null>(null);
  readonly guardandoId = signal<string | null>(null);
 
  ngOnInit(): void {
    this.cargarUsuarios();
  }
 
  filtrar(rol: string): void {
    this.rolFiltro.set(rol);
    this.cargarUsuarios();
  }
 
  private cargarUsuarios(): void {
    this.loading.set(true);
    this.error.set(null);
 
    const rol = (this.rolFiltro() || undefined) as Role | undefined;
 
    this.usersService.getAll(rol).subscribe({
      next: (usuarios: UserProfile[]) => {
        this.usuarios.set(usuarios);
        this.loading.set(false);
      },
      error: (err: any) => {
        this.error.set(err.error?.error ?? 'No se pudo cargar la lista de usuarios');
        this.loading.set(false);
      },
    });
  }
 
  cambiarRol(usuario: UserProfile, nuevoRol: Role): void {
    if (nuevoRol === usuario.role) {
      return;
    }
 
    this.guardandoId.set(usuario.id);
 
    this.usersService.changeRole(usuario.id, nuevoRol).subscribe({
      next: () => {
        this.usuarios.update((lista) =>
          lista.map((u) => (u.id === usuario.id ? { ...u, role: nuevoRol } : u)),
        );
        this.guardandoId.set(null);
        this.toastService.success(
          `Rol actualizado. ${usuario.displayName} lo verá recién cuando vuelva a iniciar sesión.`,
        );
      },
      error: (err: any) => {
        this.guardandoId.set(null);
        this.toastService.error(err.error?.error ?? 'No se pudo cambiar el rol');
      },
    });
  }
}
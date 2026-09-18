import { Component, inject } from '@angular/core';
import { Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { NotificationBellComponent } from '../../shared/notification-bell/notification-bell';

interface NavLink {
  path: string;
  label: string;
}

@Component({
  selector: 'app-main-layout',
  imports: [RouterLink, RouterLinkActive, RouterOutlet, NotificationBellComponent],
  templateUrl: './main-layout.html',
  styleUrl: './main-layout.css',
})
export class MainLayoutComponent {
  auth = inject(AuthService);
  private router = inject(Router);

  links(): NavLink[] {
    const links: NavLink[] = [
      { path: '/inicio', label: 'Inicio' },
      { path: '/reportes', label: 'Reportes' },
      { path: '/reportes/mios', label: 'Mis reportes' },
      { path: '/perfil', label: 'Mi perfil' },
    ];

    if (this.auth.isAdmin()) {
      links.push(
        { path: '/admin', label: 'Dashboard' },
        { path: '/admin/zonas', label: 'Zonas' },
        { path: '/admin/tecnicos', label: 'Técnicos' },
        { path: '/admin/usuarios', label: 'Usuarios' },
      );
    }

    if (this.auth.isTecnico()) {
      links.push({ path: '/tecnico', label: 'Mi trabajo' });
    }

    return links;
  }

  logout(): void {
    this.auth.logout();
    this.router.navigate(['/login']);
  }
}

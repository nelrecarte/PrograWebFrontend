import { Routes } from '@angular/router';
import { adminGuard, authGuard, guestGuard, tecnicoGuard } from './services/auth.guard';
import { ForbiddenComponent } from './pages/forbidden/forbidden';
import { TechWorkspaceComponent } from './pages/tech-workspace/tech-workspace';
import { HomeComponent } from './pages/home/home';
import { ForgotPasswordComponent } from './pages/forgot-password/forgot-password';
import { LandingComponent } from './pages/landing/landing';
import { LoginComponent } from './pages/login/login';
import { MyReportsComponent } from './pages/my-reports/my-reports';
import { NotFoundComponent } from './pages/not-found/not-found';
import { RegisterComponent } from './pages/register/register';
import { ReportCreateComponent } from './pages/report-create/report-create';
import { ReportDetailComponent } from './pages/report-detail/report-detail';
import { ReportListComponent } from './pages/report-list/report-list';
import { MainLayoutComponent } from './layout/main-layout/main-layout';
import { ZonesAdminComponent } from './pages/zones-admin/zones-admin';
import { TechniciansAdminComponent } from './pages/technicians-admin/technicians-admin';
import { ProfileComponent } from './pages/profile/profile';
import { UsersAdminComponent } from './pages/users-admin/users-admin';
import { DashboardComponent } from './pages/dashboard/dashboard';

export const routes: Routes = [
  { path: '', component: LandingComponent, pathMatch: 'full' },
  { path: 'login', component: LoginComponent, canActivate: [guestGuard] },
  { path: 'registro', component: RegisterComponent, canActivate: [guestGuard] },
  { path: 'recuperar-password', component: ForgotPasswordComponent, canActivate: [guestGuard] },

  {
    path: '',
    component: MainLayoutComponent,
    canActivate: [authGuard],
    children: [
      { path: 'inicio', component: HomeComponent },
      { path: 'perfil', component: ProfileComponent },

      { path: 'reportes', component: ReportListComponent },
      { path: 'reportes/nuevo', component: ReportCreateComponent },
      { path: 'reportes/mios', component: MyReportsComponent },
      { path: 'reportes/:id', component: ReportDetailComponent },

      { path: 'admin', component: DashboardComponent, canActivate: [adminGuard] },
      { path: 'admin/zonas', component: ZonesAdminComponent, canActivate: [adminGuard] },
      { path: 'admin/tecnicos', component: TechniciansAdminComponent, canActivate: [adminGuard] },
      { path: 'admin/usuarios', component: UsersAdminComponent, canActivate: [adminGuard] },

      { path: 'tecnico', component: TechWorkspaceComponent, canActivate: [tecnicoGuard] },

      { path: 'sin-permiso', component: ForbiddenComponent },
    ],
  },

  { path: '**', component: NotFoundComponent },
];

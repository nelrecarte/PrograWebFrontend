import { Routes } from '@angular/router';
import { adminGuard, authGuard, guestGuard } from './guards/auth.guard';
import { ForbiddenComponent } from './pages/forbidden.component';
import { HomeComponent } from './pages/home.component';
import { LoginComponent } from './pages/login.component';
import { MyReportsComponent } from './pages/my-reports.component';
import { NotFoundComponent } from './pages/not-found.component';
import { RegisterComponent } from './pages/register.component';
import { ReportCreateComponent } from './pages/report-create.component';
import { ReportDetailComponent } from './pages/report-detail.component';
import { ReportListComponent } from './pages/report-list.component';
import { MainLayoutComponent } from './layout/main-layout.component';
import { TechniciansAdminComponent } from './pages/technicians-admin.component';

export const routes: Routes = [
  { path: 'login', component: LoginComponent, canActivate: [guestGuard] },
  { path: 'registro', component: RegisterComponent, canActivate: [guestGuard] },

  {
    path: '',
    component: MainLayoutComponent,
    canActivate: [authGuard],
    children: [
      { path: '', redirectTo: 'inicio', pathMatch: 'full' },
      { path: 'inicio', component: HomeComponent },
      { path: 'admin/tecnicos', component: TechniciansAdminComponent, canActivate: [adminGuard] },

      // 'nuevo' y 'mios' tienen que ir antes que ':id'
      { path: 'reportes', component: ReportListComponent },
      { path: 'reportes/nuevo', component: ReportCreateComponent },
      { path: 'reportes/mios', component: MyReportsComponent },
      { path: 'reportes/:id', component: ReportDetailComponent },

      // Para las pantallas que faltan, con su guard:
      // { path: 'admin', component: DashboardComponent, canActivate: [adminGuard] },

      { path: 'sin-permiso', component: ForbiddenComponent },
    ],
  },

  { path: '**', component: NotFoundComponent },
];

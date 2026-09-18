import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
 
import { AuthService } from '../services/auth.service';
import { UsersService } from '../services/users.service';
import { ZonesService } from '../services/zones.service';
import { ToastService } from '../services/toast.service';
import { UpdateProfileRequest, UserProfile } from '../models/user.model';
import { Zone } from '../models/zone.model';
 
@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <section class="profile">
      <h1>Mi perfil</h1>
 
      @if (loading()) {
        <p>Cargando perfil...</p>
      } @else {
        <form [formGroup]="form" (ngSubmit)="guardar()">
          @if (error()) {
            <p class="form-error">{{ error() }}</p>
          }
 
          <label>
            Nombre
            <input type="text" formControlName="displayName" />
          </label>
 
          <label>
            Teléfono
            <input type="text" formControlName="phoneNumber" />
          </label>
 
          <label>
            País
            <input type="text" formControlName="country" />
          </label>
 
          <label>
            Bio
            <textarea formControlName="bio" rows="3"></textarea>
          </label>
 
          <label>
            Zona
            <select formControlName="zoneId">
              <option value="" disabled>Elegí tu zona</option>
              @for (zone of zones(); track zone.id) {
                <option [value]="zone.id">{{ zone.name }}</option>
              }
            </select>
          </label>
 
          <button type="submit" [disabled]="form.invalid || saving()">
            {{ saving() ? 'Guardando...' : 'Guardar cambios' }}
          </button>
        </form>
      }
    </section>
  `,
  styles: [`
    .profile { max-width: 480px; margin: 0 auto; display: flex; flex-direction: column; gap: 1rem; }
    form { display: flex; flex-direction: column; gap: 1rem; }
    label { display: flex; flex-direction: column; gap: 0.35rem; font-size: 0.9rem; }
    input, select, textarea { padding: 0.5rem; font: inherit; }
    .form-error { color: #b31e1e; }
  `],
})
export class ProfileComponent implements OnInit {
  private readonly authService = inject(AuthService);
  private readonly usersService = inject(UsersService);
  private readonly zonesService = inject(ZonesService);
  private readonly toastService = inject(ToastService);
  private readonly fb = inject(FormBuilder);
 
  readonly loading = signal(true);
  readonly saving = signal(false);
  readonly error = signal<string | null>(null);
  readonly zones = signal<Zone[]>([]);
 
  readonly form = this.fb.nonNullable.group({
    displayName: ['', Validators.required],
    phoneNumber: [''],
    country: [''],
    bio: [''],
    zoneId: ['', Validators.required],
  });
 
  ngOnInit(): void {
    this.cargarZonas();
    this.cargarPerfil();
  }
 
  private cargarZonas(): void {
    // Solo zonas activas: no tiene sentido dejar elegir una zona dada de baja.
    this.zonesService.getAll(true).subscribe({
      next: (zones) => this.zones.set(zones),
      error: (err: any) => {
        this.toastService.error(err.error?.error ?? 'No se pudieron cargar las zonas');
      },
    });
  }
 
  private cargarPerfil(): void {
    this.loading.set(true);
    this.usersService.getMe().subscribe({
      next: (user: UserProfile) => {
        this.form.patchValue({
          displayName: user.displayName,
          phoneNumber: user.phoneNumber ?? '',
          country: user.country ?? '',
          bio: user.bio ?? '',
          zoneId: user.zoneId ?? '',
        });
        this.loading.set(false);
      },
      error: (err: any) => {
        this.error.set(err.error?.error ?? 'No se pudo cargar tu perfil');
        this.loading.set(false);
      },
    });
  }
 
  guardar(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
 
    this.saving.set(true);
    this.error.set(null);
 
    const payload: UpdateProfileRequest = this.form.getRawValue();
 
    this.usersService.updateMe(payload).subscribe({
      next: () => {
        // Sin esto, el navbar y el localStorage se quedan con los datos
        // viejos hasta que la persona vuelva a iniciar sesión.
        this.authService.loadProfile().subscribe({
          next: () => {
            this.saving.set(false);
            this.toastService.success('Perfil actualizado');
          },
          error: () => {
            // El perfil ya se guardó en el backend; solo falló refrescar
            // los datos locales, así que igual avisamos éxito.
            this.saving.set(false);
            this.toastService.success('Perfil actualizado');
          },
        });
      },
      error: (err: any) => {
        this.saving.set(false);
        this.error.set(err.error?.error ?? 'No se pudo guardar el perfil');
      },
    });
  }
}
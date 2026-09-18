import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
 
import { AuthService } from '../../services/auth.service';
import { UsersService } from '../../services/users.service';
import { ZonesService } from '../../services/zones.service';
import { ToastService } from '../../services/toast.service';
import { UpdateProfileRequest, UserProfile } from '../../models/user.model';
import { Zone } from '../../models/zone.model';
 
@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './profile.html',
  styleUrl: './profile.css',
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
        this.authService.loadProfile().subscribe({
          next: () => {
            this.saving.set(false);
            this.toastService.success('Perfil actualizado');
          },
          error: () => {
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
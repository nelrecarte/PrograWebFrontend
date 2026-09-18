import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { ToastService } from '../../services/toast.service';
import { dateToIso } from '../../shared/date-utils';

@Component({
  selector: 'app-register',
  imports: [ReactiveFormsModule, RouterLink],
  templateUrl: './register.html',
  styleUrl: './register.css',
})
export class RegisterComponent {
  private fb = inject(FormBuilder);
  private auth = inject(AuthService);
  private router = inject(Router);
  private toast = inject(ToastService);

  loading = signal(false);

  form = this.fb.nonNullable.group({
    displayName: ['', Validators.required],
    username: ['', Validators.required],
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(6)]],
    phoneNumber: ['', Validators.required],
    birthDate: ['', Validators.required],
    country: ['Honduras', Validators.required],
    bio: [''],
  });

  submit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const values = this.form.getRawValue();
    this.loading.set(true);

    this.auth
      .register({ ...values, birthDate: dateToIso(values.birthDate) })
      .subscribe({
        next: (profile) => {
          this.loading.set(false);
          this.toast.success('¡Listo! Tu cuenta ya está creada.');
          this.router.navigate([this.auth.homeFor(profile.role)]);
        },
        error: (err) => {
          this.loading.set(false);
          this.toast.error(err.error?.error ?? 'No se pudo crear la cuenta.');
        },
      });
  }
}

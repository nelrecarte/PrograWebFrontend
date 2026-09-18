import { Component, inject, OnInit, signal } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Technician } from '../../models/technician.model';
import { UserProfile } from '../../models/user.model';
import { Zone } from '../../models/zone.model';
import { TechniciansService } from '../../services/technicians.service';
import { ToastService } from '../../services/toast.service';
import { UsersService } from '../../services/users.service';
import { ZonesService } from '../../services/zones.service';

@Component({
  selector: 'app-technicians-admin',
  imports: [ReactiveFormsModule],
  templateUrl: './technicians-admin.html',
  styleUrl: './technicians-admin.css',
})

export class TechniciansAdminComponent implements OnInit {
  private fb = inject(FormBuilder);
  private techniciansService = inject(TechniciansService);
  private usersService = inject(UsersService);
  private zonesService = inject(ZonesService);
  private toast = inject(ToastService);

  loading = signal(true);
  submitting = signal(false);
  savingEdit = signal(false);
  togglingId = signal<string | null>(null);
  showCreate = signal(false);
  editingId = signal<string | null>(null);

  technicians = signal<Technician[]>([]);
  citizens = signal<UserProfile[]>([]);
  zones = signal<Zone[]>([]);

  createForm = this.fb.nonNullable.group({
    userId: ['', Validators.required],
    fullName: ['', Validators.required],
    zoneId: ['', Validators.required],
    isAvailable: [true],
  });

  editForm = this.fb.nonNullable.group({
    zoneId: ['', Validators.required],
    isAvailable: [true],
  });

  ngOnInit(): void {
    this.techniciansService.getAll().subscribe({
      next: (technicians) => {
        this.technicians.set(technicians);
        this.loading.set(false);
      },
      error: (err) => {
        this.loading.set(false);
        this.toast.error(err.error?.error ?? 'No se pudieron cargar los técnicos.');
      },
    });

    this.usersService.getAll('Ciudadano').subscribe({
      next: (users) => this.citizens.set(users),
      error: () => this.citizens.set([]),
    });

    this.zonesService.getAll(true).subscribe({
      next: (zones) => this.zones.set(zones),
      error: () => this.zones.set([]),
    });
  }

  toggleCreate(): void {
    this.showCreate.update((v) => !v);
    if(!this.showCreate()){
      this.createForm.reset({userId: '', fullName: '', zoneId: '', isAvailable: true});
    }
  }
  onCitizenChange(): void {
    const userId = this.createForm.controls.userId.value;
    const citizen = this.citizens().find((c) => c.id === userId);
    if (citizen) {
      this.createForm.controls.fullName.setValue(citizen.displayName);
    }
  }

  create(): void {
    if (this.createForm.invalid) {
      return;
    }

    this.submitting.set(true);
    const values =  this.createForm.getRawValue();

    this.techniciansService.create({
      userId: values.userId,
      fullName: values.fullName,
      zoneId: values.zoneId,
      isAvailable: values.isAvailable,
    })
    .subscribe({
      next: (technicians) => {
        this.submitting.set(false);
        this.technicians.update((list) => [...list, technicians]);

        this.citizens.update((list) => list.filter((c) => c.id !== technicians.userId));
        this.toast.success('Técnico dado de alta');
        this.showCreate.set(false);
        this.createForm.reset({userId: '', fullName: '', zoneId: '', isAvailable: true});
      },
      error: (err) => {
        this.submitting.set(false);
        this.toast.error(err.error?.error ?? 'No se pudo dar de alta al técnico');
      },
    });
  }

  startEditing(tech: Technician): void {
    this.editingId.set(tech.id);
    this.editForm.setValue({zoneId: tech.zoneId, isAvailable: tech.isAvailable});
  }

  cancelEdit(): void {
    this.editingId.set(null);
  }

  saveEdit(tech: Technician): void {
    if (this.editForm.invalid) {
      return;
    }

    this.savingEdit.set(true);
    const values =  this.editForm.getRawValue();

    this.techniciansService.update(tech.id, {fullName: tech.fullName, zoneId: values.zoneId, isAvailable: values.isAvailable})
    .subscribe({
      next: (updated) => {
        this.savingEdit.set(false);
        this.technicians.update((list) => list.map((t) => (t.id === updated.id ? updated : t)));
        this.toast.success('Técnico actualizado');
        this.editingId.set(null);
      },
      error: (err) => {
        this.savingEdit.set(false);
        this.toast.error(err.error?.error ?? 'No se pudo actualizar el técnico');
      },
    });
  }

  activate(tech: Technician): void {
    this.togglingId.set(tech.id);
    this.techniciansService.activate(tech.id).subscribe({
      next: (updated) => {
        this.togglingId.set(null);
        this.technicians.update((list) => list.map((t) => (t.id === updated.id ? updated : t)));
        this.toast.success('Técnico Activado');
      },
      error: (err) => {
        this.togglingId.set(null);
        this.toast.error(err.error?.error ?? 'No se pudo activar al técnico');
      },
    });
  }

  deactivate(tech: Technician): void {
    this.togglingId.set(tech.id);
    this.techniciansService.deactivate(tech.id).subscribe({
      next: (updated) => {
        this.togglingId.set(null);
        this.technicians.update((list) => list.map((t) => (t.id === updated.id ? updated : t)));
        this.toast.success('Técnico desactivado');
      },
      error: (err) => {
        this.togglingId.set(null);
        this.toast.error(err.error?.error ?? 'No se pudo desactivar el técnico');
      },
    });
  }
}

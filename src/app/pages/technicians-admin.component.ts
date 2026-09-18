import { Component, inject, OnInit, signal } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Technician } from '../models/technician.model';
import { UserProfile } from '../models/user.model';
import { Zone } from '../models/zone.model';
import { TechniciansService } from '../services/technicians.service';
import { ToastService } from '../services/toast.service';
import { UsersService } from '../services/users.service';
import { ZonesService } from '../services/zones.service';

@Component({
  selector: 'app-technicians-admin',
  imports: [ReactiveFormsModule],
  template: `
  <div class="mb-6 flex flex-wrap items-center justify-between gap-4">
    <h1 class="text-2xl font-bold text-slate-900">Técnicos</h1>
    <button
      type="button"
      (click)="toggleCreate()"
      class="rounded-lg bg-brand-600 px-4 py-2 text-sm font-semibold text-white hover:bg-brand-700"
      >
      {{ showCreate() ? 'Cancelar' : 'Nuevo Técnico' }}
    </button>
  </div>

  @if (showCreate()){
    <form
      [formGroup]="createForm"
      (ngSubmit)="create()"
      class="mb-6 grid gap-3 rounded-xl border-slate-200 bg-white p-4 sm:grid-cols-2"
      >
      <label class="text-sm sm:col-span-2">
        <span class="mb-1 block font-medium text-slate-700">Ciudadano
        </span>
        <select
          formControlName="userId"
          (change)="onCitizenChange()"
          class="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
          >
          <option value="">Elegí un ciudadano registrado</option>
          @for (citizen of citizens(); track citizen.id){
          <option [value]="citizen.id">{{ citizen.displayName }} - {{ citizen.email }}</option>
            }
        </select>
        @if(citizens().length === 0){
          <span class="mt-1 block text-xs text-slate-500">No hay ciudadanos disponibles para promover </span>
        }
      </label>

      <label class="text-sm sm:col-span-2">
        <span class="mb-1 block font-medium text-slate-700">Nombre completo </span>
        <input
          type="text"
          formControlName="fullName"
          class="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
          />
      </label>

      <label class="text-sm">
        <span class="mb-1 block font-medium text-slate-700">Zona</span>
        <select formControlName="zoneId" class="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm">
          <option value="">Elegí una zona </option>
          @for (zone of zones(); track zone.id){
            <option [value]="zone.id">{{ zone.name }}</option>
          }
        </select>
      </label>
      <label class="flex items-center gap-2 self-end text-sm">
        <input type="checkbox" formControlName="isAvailable" class="h-4 w-4 rounded border-slate-300" />
        <span class="font-medium text-slate-700">Disponible</span>
      </label>

      <div class="sm:col-span-2">
        <button
          type="submit"
          [disabled]="createForm.invalid || submitting()"
          class="w-full rounded-lg bg-brand-600 px-4 py-2 text-sm font-semibold text-white hover:bg-brand-700 disabled:opacity-60 sm:w-auto">

          {{ submitting() ? 'Guardando...' : 'Dar de alta'}}
        </button>
      </div>
    </form>
  }

  @if (loading()){
    <p class="py-10 text-center text-sm text-slate-500">Cargando...</p>
  } @else if (technicians().length === 0) {
    <div class="rounded-xl border border-dashed border-slate-300 bg-white px-6 py-12 text-center">
      <p class="text-sm font-medium text-slate-700">No hay técnicos dados de alta</p>
    </div>
  } @else {
    <div class="overflow-x-auto rounded-xl border border-slate-200 bg-white">
      <table class="w-full text-left text-sm">
        <thead class="border-b border-slate-200 bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
        <tr>
          <th class="px-4 py-3">Nombre</th>
          <th class="px-4 py-3">Zona</th>
          <th class="px-4 py-3">Disponible</th>
          <th class="px-4 py-3">Estado</th>
          <th class="px-4 py-3">Reportes activos</th>
          <th class="px-4 py-3">Acciones</th>
        </tr>
        </thead>
        <tbody class="divide-y divide-slate-100">
        @for (tech of technicians(); track tech.id){
          <tr>
            <td class="px-4 py-3">
              <p class="font-medium text-slate-900">{{ tech.fullName }}</p>
              <p class="text-xs text-slate-500">{{ tech.email }}</p>
            </td>

            @if (editingId() === tech.id){
              <td class="px-4 py-3">
                <select
                  [formControl]="editForm.controls.zoneId"
                  class="w-full rounded-lg border border-slate-300 px-2 py-1.5 text-sm"
                  >
                  @for (zone of zones(); track zone.id){
                    <option [value]="zone.id">{{ zone.name }}</option>
                  }
                </select>
              </td>
              <td class="px-4 py-3">
                <input type="checkbox" [formControl]="editForm.controls.isAvailable" class="h-4 w-4 rounded border-slate-300" />
              </td>
            } @else {
              <td class="px-4 py-3 text-slate-700">{{ tech.zoneName}}</td>
              <td class="px-4 py-3">
                <span
                  class="inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold ring-1 ring-inset"
                  [class]="
                    tech.isAvailable
                    ? 'bg-emerald-100 text-emerald-800 ring-emerald-200'
                        : 'bg-slate-100 text-slate-700 ring-slate-200'
                  "
                >
                  {{ tech.isAvailable ? 'Si' : 'No' }}
                </span>
              </td>
            }
            <td class="px-4 py-3">
              <span
                class="inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold ring-1 ring-inset"
                [class]="
                    tech.isActive
                      ? 'bg-emerald-100 text-emerald-800 ring-emerald-200'
                      : 'bg-red-100 text-red-800 ring-red-200'
                "
              >
                {{ tech.isActive ? 'Activo' : 'Inactivo' }}
              </span>
            </td>

            <td class="px-4 py-3 text-slate-700">{{ tech.activeReportCount }}</td>

            <td class="px-4 py-3">
              @if (editingId() === tech.id){
                <div class="flex flex-wrap gap-2">
                  <button
                    type="button"
                    [disabled]="editForm.invalid || savingEdit()"
                    (click)="saveEdit(tech)"
                    class="rounded-lg bg-brand-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-brand-700 disabled:opacity-60"
                    >
                    {{ savingEdit() ? 'Guardando..' : 'Guardar' }}
                  </button>
                  <button
                    type="button"
                    (click)="cancelEdit()"
                    class="rounded-lg border-slate-300 px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50"
                    >
                    Cancelar
                  </button>
                </div>
              } @else {
                <div class="flex flex-wrap gap-2">
                  <button
                    type="button"
                    (click)="startEditing(tech)"
                    class="rounded-lg border border-slate-300 px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50"
                    >

                    Editar
                  </button>
                  @if (tech.isActive) {
                    <button
                      type="button"
                      [disabled]="togglingId() === tech.id"
                      (click)="deactivate(tech)"
                      class="rounded-lg border-red-300 px-3 py-1.5 text-xs font-medium text-red-700 hover:bg-red-50 disabled:opacity-60"
                    >
                      Desactivar
                    </button>
                  } @else {
                    <button
                      type="button"
                      [disabled]="togglingId() === tech.id"
                      (click)="activate(tech)"
                      class="rounded-lg border border-emerald-300 px-3 py-1.5 text-xs font-medium text-emerald-700 hover:bg-emerald-50 disabled:opacity-60"
                    >
                      Activar
                    </button>
                  }

                </div>
              }
            </td>
          </tr>
        }
        </tbody>
      </table>
    </div>
  }

  `,
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

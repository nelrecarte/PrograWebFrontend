import { Component, inject, OnInit, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { Zone, ZoneRequest } from '../../models/zone.model';
import { ZonesService } from '../../services/zones.service';
import { ToastService } from '../../services/toast.service';

@Component({
  selector: 'app-zones-admin',
  imports: [ReactiveFormsModule, RouterLink],
  templateUrl: './zones-admin.html',
  styleUrl: './zones-admin.css',
})
export class ZonesAdminComponent implements OnInit {
  private fb = inject(FormBuilder);
  private zonesService = inject(ZonesService);
  private toast = inject(ToastService);

  loading = signal(true);
  saving = signal(false);
  zones = signal<Zone[]>([]);
  editingZone = signal<Zone | null>(null);
  showForm = signal(false);

  form = this.fb.nonNullable.group({
    name: ['', Validators.required],
    sector: ['', Validators.required],
    description: ['', Validators.required],
  });

  ngOnInit(): void {
    this.load();
  }

  load(): void {
    this.loading.set(true);

    this.zonesService.getAll().subscribe({
      next: (zones) => {
        this.zones.set(zones);
        this.loading.set(false);
      },
      error: (err) => {
        this.loading.set(false);
        this.toast.error(
          err.error?.error ?? 'No se pudieron cargar las zonas.'
        );
      },
    });
  }

  newZone(): void {
    this.editingZone.set(null);
    this.form.reset();
    this.showForm.set(true);
  }

  edit(zone: Zone): void {
    this.editingZone.set(zone);

    this.form.setValue({
      name: zone.name,
      sector: zone.sector,
      description: zone.description,
    });

    this.showForm.set(true);
  }

  cancel(): void {
    this.editingZone.set(null);
    this.form.reset();
    this.showForm.set(false);
  }

  save(): void {
    if (this.form.invalid || this.saving()) {
      return;
    }

    const data: ZoneRequest = this.form.getRawValue();
    const zone = this.editingZone();

    this.saving.set(true);

    if (zone) {
      this.zonesService
        .update(zone.id, {
          ...data,
          isActive: zone.isActive,
        })
        .subscribe({
          next: (updated) => {
            this.zones.update((list) =>
              list.map((item) =>
                item.id === updated.id ? updated : item
              )
            );

            this.saving.set(false);
            this.cancel();
            this.toast.success('Zona actualizada correctamente.');
          },
          error: (err) => {
            this.saving.set(false);
            this.toast.error(
              err.error?.error ?? 'No se pudo actualizar la zona.'
            );
          },
        });

      return;
    }

    this.zonesService.create(data).subscribe({
      next: (created) => {
        this.zones.update((list) => [...list, created]);
        this.saving.set(false);
        this.cancel();
        this.toast.success('Zona creada correctamente.');
      },
      error: (err) => {
        this.saving.set(false);
        this.toast.error(
          err.error?.error ?? 'No se pudo crear la zona.'
        );
      },
    });
  }

  deactivate(zone: Zone): void {
    const confirmed = window.confirm(
      `¿Deseas desactivar la zona "${zone.name}"?`
    );

    if (!confirmed) {
      return;
    }

    this.zonesService.delete(zone.id).subscribe({
      next: () => {
        this.zones.update((list) =>
          list.map((item) =>
            item.id === zone.id
              ? { ...item, isActive: false }
              : item
          )
        );

        this.toast.success('Zona desactivada correctamente.');
      },
      error: (err) => {
        this.toast.error(
          err.error?.error ?? 'No se pudo desactivar la zona.'
        );
      },
    });
  }
}

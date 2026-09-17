import {Component, inject, OnInit, signal} from '@angular/core';
import {FormBuilder, FormGroup, ReactiveFormsModule, Validators} from '@angular/forms';
import {Technician} from '../models/technician.model';
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
  <h1>Administración de Técnicos</h1>
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
}

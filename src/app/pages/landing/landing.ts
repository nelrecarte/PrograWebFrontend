import { Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-landing',
  imports: [RouterLink],
  templateUrl: './landing.html',
  styleUrl: './landing.css',
})
export class LandingComponent {
  auth = inject(AuthService);

  panel(): string {
    return this.auth.homeFor(this.auth.role() ?? 'Ciudadano');
  }
}

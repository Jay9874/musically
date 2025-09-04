import { Component, inject, OnInit, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-resend-link',
  imports: [FormsModule],
  templateUrl: './resend-link.component.html',
  styleUrls: ['./resend-link.component.css', '../../../styles.css'],
})
export class ResendLinkComponent {
  readonly apiBaseUrl = 'api/auth/resend-link';
  statusCode = signal<number | null>(null);
  email = signal<string | null>(null);

  private activatedRoute = inject(ActivatedRoute);

  constructor() {
    this.activatedRoute.queryParams.subscribe((params) => {
      this.email.set(params['email']);
      this.statusCode.set(params['code']);
    });
  }

  ngOnInit(): void {
    console.log('the code: ', this.statusCode());
    console.log('email: ', this.email());
  }

  onSubmit(): void {}
}

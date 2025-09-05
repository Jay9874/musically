import { Component, inject, OnInit, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { SecurityService } from '../../services/security/security.service';
import { HttpErrorResponse } from '@angular/common/http';
import { ToastService } from '../../toast/services/toast.service';

@Component({
  selector: 'app-resend-link',
  imports: [FormsModule],
  templateUrl: './resend-link.component.html',
  styleUrls: ['./resend-link.component.css', '../../../styles.css'],
})
export class ResendLinkComponent {
  readonly apiBaseUrl = 'api/auth/resend-link';
  private activatedRoute: ActivatedRoute = inject(ActivatedRoute);
  securityService: SecurityService = inject(SecurityService);
  private toast: ToastService = inject(ToastService);

  statusCode = signal<number | null>(null);
  email = signal<string | null>(null);

  constructor() {
    this.activatedRoute.queryParams.subscribe((params) => {
      this.email.set(params['email']);
      this.statusCode.set(params['code']);
    });
  }

  onSubmit(): void {
    this.securityService.loading.set(true);
    this.securityService.resendVerificationLink(this.email()!).subscribe({
      next: (res) => {
        console.log('res: ', res);
        this.toast.success('Resent verification email successfully.');
      },
      error: (err) => {
        console.log('err: ', err);
        const { error }: { error: HttpErrorResponse } = err;
        this.toast.error(error.message);
      },
      complete: () => {
        this.securityService.loading.set(false);
      },
    });
  }
}

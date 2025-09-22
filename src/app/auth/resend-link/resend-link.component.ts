import { Component, inject, model, OnInit, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { SecurityService } from '../../services/security/security.service';
import { HttpErrorResponse } from '@angular/common/http';
import { ToastService } from '../../toast/services/toast.service';

@Component({
  selector: 'app-resend-link',
  imports: [FormsModule, RouterLink],
  templateUrl: './resend-link.component.html',
  styleUrls: ['./resend-link.component.css', '../../../styles.css'],
})
export class ResendLinkComponent {
  readonly apiBaseUrl = 'api/auth/resend-link';
  private route: ActivatedRoute = inject(ActivatedRoute);
  securityService: SecurityService = inject(SecurityService);
  private toast: ToastService = inject(ToastService);

  linkFor = signal('expired_otp');
  statusCode = signal<number | null>(null);
  email = model<string | null>(null);

  constructor() {
    this.route.queryParams.subscribe((params) => {
      this.email.set(params['email']);
      this.statusCode.set(params['code']);
    });

    this.route.data.subscribe((resend) => {
      this.linkFor.set(resend['for']);
    });
  }

  onSubmit(): void {
    if (this.linkFor() === 'expired_otp') {
      this.onResend();
    } else {
      this.onRecovery();
    }
  }

  onResend(): void {
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
    });
  }

  onRecovery(): void {
    this.securityService.loading.set(true);
    this.securityService.recover(this.email()!).subscribe({
      next: (res) => {
        console.log('res: ', res);
        this.toast.success('Sent a recovery email, check it out.');
        this.securityService.loading.set(false);
      },
      error: (err) => {
        console.log('err: ', err);
        const { error }: { error: HttpErrorResponse } = err;
        this.toast.error(error.message);
        this.securityService.loading.set(false);
      },
    });
  }
}

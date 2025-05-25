import {
  Component,
  inject,
  makeStateKey,
  REQUEST,
  REQUEST_CONTEXT,
  TransferState,
  VERSION,
} from '@angular/core';
import { RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css',
})
export class AppComponent {
  version = VERSION.full;
  server: string | undefined;
  transferState = inject(TransferState);
  serverKey = makeStateKey<string>('server');

  constructor() {
    const request = inject(REQUEST, { optional: true });
    if (request) {
      console.log('Server received a request', request.url);
    }

    const reqContext = inject(REQUEST_CONTEXT, { optional: true }) as {
      server: string;
    };
    if (reqContext) {
      // The context is defined in the server*.ts file
      this.server = reqContext.server;

      // Store this as this won't be available on hydration
      this.transferState.set(this.serverKey, this.server);
    }
    this.server = this.transferState.get(this.serverKey, '');
  }
}

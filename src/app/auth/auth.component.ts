import { NgFor } from '@angular/common';
import { Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { QuoteService } from '../quote.service';
import { Quote } from '../quote';
import { QuoteComponent } from '../quote/quote.component';

@Component({
  selector: 'app-auth',
  imports: [NgFor, QuoteComponent],
  templateUrl: './auth.component.html',
  styleUrl: './auth.component.scss',
})
export class AuthComponent {
  quoteService: QuoteService = inject(QuoteService);
  quotes: Quote[] = [];

  constructor() {
    this.quotes = this.quoteService.getAllQuotes();
  }
}

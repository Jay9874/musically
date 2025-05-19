import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { QuoteService } from '../quote.service';
import { inject } from '@angular/core';
import { Quote } from '../quote';
import { QuoteComponent } from '../quote/quote.component';
import { NgFor } from '@angular/common';

@Component({
  selector: 'app-auth-index',
  imports: [RouterLink, QuoteComponent, NgFor],
  templateUrl: './auth-index.component.html',
  styleUrl: './auth-index.component.css',
})
export class AuthIndexComponent {
  quoteService: QuoteService = inject(QuoteService);
  quotes: Quote[] = [];

  constructor() {
    this.quotes = this.quoteService.getAllQuotes();
  }
}

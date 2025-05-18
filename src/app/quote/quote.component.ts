import { Component, Input } from '@angular/core';
import { Quote } from '../quote';

@Component({
  selector: 'app-quote',
  imports: [],
  templateUrl: './quote.component.html',
  styleUrl: './quote.component.scss',
})
export class QuoteComponent {
  @Input() quote!: Quote;
}

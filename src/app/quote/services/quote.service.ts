import { Injectable } from '@angular/core';
import { Quote } from './quote';
@Injectable({
  providedIn: 'root',
})
export class QuoteService {
  quotes: Quote[] = [
    {
      id: 0,
      quote:
        'Music is the divine echo of the soul’s yearning to understand itself, a bridge between the rational and the infinite.',
      author: 'Ludwig van Beethoven',
      profession: 'Composer',
    },
    {
      id: 1,
      quote:
        'Where philosophy ends in abstraction, music begins in experience—it teaches us not what to think, but how to feel wisely.',
      author: 'Albert Einstein',
      profession: 'Theoretical Physicist',
    },
    {
      id: 2,
      quote:
        'Music is the most profound form of philosophy—it explains what words cannot and unites us beyond logic or language.',
      author: 'Plato',
      profession: 'Philosopher',
    },
    {
      id: 3,
      quote:
        'Through music, we rehearse emotions the mind cannot articulate—a silent discourse between the spirit and the universe.',
      author: 'Carl Jung',
      profession: 'Psychiatrist & Psychoanalyst',
    },
    {
      id: 4,
      quote:
        'In music, I find truths no philosophy can teach—a purity of thought that resonates not through reason, but resonance.',
      author: 'Frédéric Chopin',
      profession: 'Composer & Pianist',
    },
  ];

  constructor() {}

  getAllQuotes(): Quote[] {
    return this.quotes;
  }
}

import {
  AfterViewChecked,
  AfterViewInit,
  Component,
  effect,
  ElementRef,
  inject,
  Input,
  OnChanges,
  OnInit,
  QueryList,
  signal,
  SimpleChanges,
  ViewChildren,
} from '@angular/core';
import { ToastService } from './services/toast.service';
import { Alignment, Toast } from '../../../types/interfaces/interfaces.toast';
import { CommonModule } from '@angular/common';
import { filter, map, pairwise, startWith, takeUntil } from 'rxjs';

@Component({
  selector: 'app-toast',
  imports: [CommonModule],
  templateUrl: './toast.component.html',
  styleUrl: './toast.component.css',
})
export class ToastComponent implements OnInit, AfterViewInit, OnChanges {
  @ViewChildren('toast') toastsRef!: QueryList<ElementRef>;

  @Input() alignment: Alignment = { vertical: 'top', horizontal: 'center' };
  toastService: ToastService = inject(ToastService);

  toasts = signal<Toast[]>(this.toastService.toasts());

  indexToPosition = new Map<number, string>([
    [0, 'move-last'],
    [1, 'move-second'],
    [2, 'frontier'],
  ]);

  constructor() {
    effect(() => {
      if (this.toastService.toasts().length > 0) {
        this.toasts.set(this.toastService.toasts());
      }
    });
  }

  ngOnInit(): void {}

  ngOnChanges(changes: SimpleChanges): void {
    console.log('changed: ', changes);
  }

  ngAfterViewInit(): void {
    // Subscribe to changes in the QueryList for dynamic elements
    this.toastsRef.changes
      // .pipe(
      //   // 1. startWith(this.listItems): Emit the initial QueryList first
      //   startWith(this.toastsRef),
      //   // 2. pairwise(): Emit arrays of [previous, current] QueryList
      //   pairwise(),
      //   // 3. map(): Transform to an object indicating counts for easier comparison
      //   map(([prev, curr]) => ({
      //     prevLength: prev.length,
      //     currLength: curr.length,
      //     currList: curr, // Keep reference to the current list for processing
      //     all: [...prev, curr],
      //   })),
      //   // 4. filter(): Only allow emissions where the current length is greater than the previous
      //   filter(({ prevLength, currLength }) => currLength > prevLength)
      // )
  
      .subscribe((queryList: QueryList<ElementRef>) => {
        this.processToastElement(queryList.length);
      });
  }

  // Helper method to process the current state of myDivs
  private processToastElement(length: number): void {
    this.toastsRef.forEach((elementRef: ElementRef, index: number) => {
      if (length == 1) {
        elementRef.nativeElement.classList.add('frontier');
      } else if (length === 2) {
        if (index == 0) {
          elementRef.nativeElement.classList.add('move-second');
        } else {
          elementRef.nativeElement.classList.add('frontier');
        }
      } else {
        elementRef.nativeElement.classList.add(
          this.indexToPosition.get(index)!
        );
      }
      setTimeout(() => {
        elementRef.nativeElement.classList.add('remove');
      }, 1000);
    });
  }

  // Getting dynamic toast position in stack
  // getPosition(index: number): string {
  //   try {
  //     let position: string = 'frontier';
  //     if (this.toasts().length === 1) return position;
  //     else if (this.toasts().length === 2) {
  //       if (index == 0) {
  //         position = 'move-second';
  //       } else {
  //         position = 'frontier';
  //       }
  //     } else {
  //       position = this.indexToPosition.get(index)!;
  //     }
  //     return position;
  //   } catch (err) {
  //     console.log('err: ', err);
  //     return '';
  //   }
  // }
}

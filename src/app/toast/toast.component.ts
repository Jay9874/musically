import {
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
    this.toastsRef.changes.subscribe((queryList: QueryList<ElementRef>) => {
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
}

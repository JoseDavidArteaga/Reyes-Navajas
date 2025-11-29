import { Component, Input, Output, EventEmitter, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-modal',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div 
      class="fixed inset-0 z-50 overflow-y-auto"
      [class.hidden]="!isOpen"
      (click)="onBackdropClick($event)">
      <!-- Backdrop -->
      <div class="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
        <div class="fixed inset-0 bg-gray-900 bg-opacity-75 transition-opacity" 
             [class.opacity-100]="isOpen" 
             [class.opacity-0]="!isOpen"></div>

        <!-- Modal container -->
        <span class="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>
        
        <div class="inline-block align-bottom bg-gray-800 rounded-lg px-4 pt-5 pb-4 text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full sm:p-6 border border-gray-700"
             [class.translate-y-0]="isOpen"
             [class.opacity-100]="isOpen"
             [class.sm:scale-100]="isOpen"
             [class.translate-y-4]="!isOpen"
             [class.opacity-0]="!isOpen"
             [class.sm:scale-95]="!isOpen">
          
          <!-- Header -->
          @if (title) {
            <div class="flex items-center justify-between mb-4">
              <h3 class="text-lg leading-6 font-medium text-gray-100">
                {{ title }}
              </h3>
              <button 
                type="button"
                (click)="close.emit()"
                class="text-gray-400 hover:text-gray-200 transition-colors">
                <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
                </svg>
              </button>
            </div>
          }

          <!-- Body -->
          <div class="text-gray-300">
            <ng-content></ng-content>
          </div>

          <!-- Footer -->
          @if (showFooter) {
            <div class="mt-6 flex flex-col sm:flex-row sm:justify-end space-y-2 sm:space-y-0 sm:space-x-3">
              @if (showCancelButton) {
                <button 
                  type="button"
                  (click)="close.emit()"
                  class="btn-secondary w-full sm:w-auto">
                  {{ cancelText }}
                </button>
              }
              @if (showConfirmButton) {
                <button 
                  type="button"
                  (click)="confirm.emit()"
                  [class]="confirmButtonClass"
                  [disabled]="loading"
                  class="w-full sm:w-auto">
                  @if (loading) {
                    <svg class="animate-spin -ml-1 mr-3 h-5 w-5 text-current inline" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                      <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                  }
                  {{ confirmText }}
                </button>
              }
            </div>
          }
        </div>
      </div>
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ModalComponent {
  @Input() isOpen: boolean = false;
  @Input() title?: string;
  @Input() showFooter: boolean = true;
  @Input() showCancelButton: boolean = true;
  @Input() showConfirmButton: boolean = true;
  @Input() cancelText: string = 'Cancelar';
  @Input() confirmText: string = 'Confirmar';
  @Input() confirmType: 'primary' | 'danger' = 'primary';
  @Input() loading: boolean = false;

  @Output() close = new EventEmitter<void>();
  @Output() confirm = new EventEmitter<void>();

  get confirmButtonClass(): string {
    const base = 'font-semibold py-2 px-4 rounded-lg transition-colors duration-200';
    if (this.confirmType === 'danger') {
      return `${base} bg-red-600 hover:bg-red-700 text-white`;
    }
    return `${base} btn-primary`;
  }

  onBackdropClick(event: MouseEvent): void {
    if (event.target === event.currentTarget) {
      this.close.emit();
    }
  }
}
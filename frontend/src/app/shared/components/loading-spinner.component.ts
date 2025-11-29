import { Component, Input, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-loading-spinner',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div [class]="containerClass">
      <div [class]="spinnerClass">
        <div class="animate-spin rounded-full border-4 border-gray-600 border-t-barberia-gold"></div>
      </div>
      @if (message) {
        <div class="mt-4 text-gray-400 text-sm">
          {{ message }}
        </div>
      }
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class LoadingSpinnerComponent {
  @Input() size: 'small' | 'medium' | 'large' = 'medium';
  @Input() message?: string;
  @Input() overlay: boolean = false;

  get containerClass(): string {
    const base = 'flex flex-col items-center justify-center';
    
    if (this.overlay) {
      return `${base} fixed inset-0 bg-barberia-darker bg-opacity-75 z-50`;
    }
    
    return `${base} py-8`;
  }

  get spinnerClass(): string {
    switch (this.size) {
      case 'small':
        return 'w-6 h-6';
      case 'large':
        return 'w-16 h-16';
      default:
        return 'w-10 h-10';
    }
  }
}
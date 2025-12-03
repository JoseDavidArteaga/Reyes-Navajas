import { Injectable } from '@angular/core';
import { AbstractControl, AsyncValidator, ValidationErrors } from '@angular/forms';
import { Observable, of, timer } from 'rxjs';
import { map, switchMap, catchError } from 'rxjs/operators';
import { AuthService } from '../services/auth.service';

@Injectable({
  providedIn: 'root'
})
export class TelefonoDisponibleValidator implements AsyncValidator {

  constructor(private authService: AuthService) {}

  validate(control: AbstractControl): Observable<ValidationErrors | null> {
    if (!control.value || control.value.length < 10) {
      return of(null); // No validar si el campo está vacío o muy corto
    }

    // Debounce para evitar múltiples llamadas mientras el usuario escribe
    return timer(500).pipe(
      switchMap(() => this.authService.verificarTelefonoDisponible(control.value)),
      map(disponible => {
        return disponible ? null : { telefonoNoDisponible: true };
      }),
      catchError(() => of(null)) // En caso de error, permitir continuar
    );
  }
}
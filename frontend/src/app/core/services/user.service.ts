// user.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class UserService {
  private apiUrl = 'http://localhost:8089/usuarios/name';

  constructor(private http: HttpClient) {}

  /**
   * Obtiene el ID (string) de un usuario por su nombre de usuario.
   * @param username Nombre de usuario (ej. 'jesus')
   * @returns Observable<string> con el ID del usuario
   */
  getUserIdByUsername(username: string): Observable<string> {
    return this.http.get<UserRepresentation>(`${this.apiUrl}/${username}`).pipe(
      map(user => {
        if (user && user.id) {
          return user.id; // Este es el campo 'id' que retorna tu backend
        } else {
          throw new Error('Usuario no encontrado o sin ID');
        }
      })
    );
  }
}

interface UserRepresentation {
  id: string; 
  username: string;
  email?: string;
  firstName?: string;
  lastName?: string;
}
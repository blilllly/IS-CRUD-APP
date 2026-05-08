import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Movie, MovieFormData } from '../models/movie.model';
import { environment } from '../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class MovieService {
  private readonly http = inject(HttpClient);
  private readonly base = `${environment.apiUrl}/api/movies`;

  getAll() {
    return this.http.get<Movie[]>(this.base);
  }

  create(data: MovieFormData) {
    return this.http.post<Movie>(this.base, data);
  }

  update(id: number, data: MovieFormData) {
    return this.http.put<Movie>(`${this.base}/${id}`, data);
  }

  delete(id: number) {
    return this.http.delete(`${this.base}/${id}`);
  }
}

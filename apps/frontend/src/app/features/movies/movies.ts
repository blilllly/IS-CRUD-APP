import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import { MovieService } from '../../core/services/movie.service';
import { Movie, MovieFormData, MovieStatus } from '../../core/models/movie.model';
import { MovieForm } from './movie-form/movie-form';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-movies',
  standalone: true,
  imports: [MovieForm, FormsModule],
  templateUrl: './movies.html',
  styleUrl: './movies.css'
})
export class Movies implements OnInit {
  private auth = inject(AuthService);
  private movieSvc = inject(MovieService);
  private router = inject(Router);

  movies = signal<Movie[]>([]);
  loading = signal(true);
  search = signal('');
  showModal = signal(false);
  editingMovie = signal<Movie | null>(null);

  filtered = computed(() => {
    const q = this.search().toLowerCase();
    return q
      ? this.movies().filter(m =>
          m.name.toLowerCase().includes(q) ||
          m.category.toLowerCase().includes(q) ||
          m.description.toLowerCase().includes(q)
        )
      : this.movies();
  });

  ngOnInit() { this.load(); }

  load() {
    this.loading.set(true);
    this.movieSvc.getAll().subscribe({
      next: data => { this.movies.set(data); this.loading.set(false); },
      error: () => this.loading.set(false)
    });
  }

  openCreate() {
    this.editingMovie.set(null);
    this.showModal.set(true);
  }

  openEdit(movie: Movie) {
    this.editingMovie.set(movie);
    this.showModal.set(true);
  }

  closeModal() {
    this.showModal.set(false);
    this.editingMovie.set(null);
  }

  onSave(data: MovieFormData) {
    const editing = this.editingMovie();
    const op = editing
      ? this.movieSvc.update(editing.id, data)
      : this.movieSvc.create(data);

    op.subscribe({ next: () => { this.closeModal(); this.load(); } });
  }

  delete(movie: Movie) {
    if (!confirm(`¿Eliminar "${movie.name}"?`)) return;
    this.movieSvc.delete(movie.id).subscribe({ next: () => this.load() });
  }

  logout() {
    this.auth.logout();
    this.router.navigate(['/login']);
  }

  statusBadge(status: string): string {
    const map: Record<string, string> = {
      Disponible:   'badge-disponible',
      NoDisponible: 'badge-nodisponible',
      Proximamente: 'badge-proximamente',
      Archivada:    'badge-archivada'
    };
    return `badge ${map[status] ?? ''}`;
  }

  statusLabel(status: string): string {
    const map: Record<string, string> = {
      Disponible:   'Disponible',
      NoDisponible: 'No Disponible',
      Proximamente: 'Próximamente',
      Archivada:    'Archivada'
    };
    return map[status] ?? status;
  }

  onSearchChange(val: string) { this.search.set(val); }
}

import { Component, computed, effect, inject, OnInit, signal } from '@angular/core';
import { Router } from '@angular/router';
import { DatePipe, CurrencyPipe } from '@angular/common';
import { AuthService } from '../../core/services/auth.service';
import { MovieService } from '../../core/services/movie.service';
import { Movie, MovieFormData, MovieStatus } from '../../core/models/movie.model';
import { MovieForm } from './movie-form/movie-form';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-movies',
  standalone: true,
  imports: [MovieForm, FormsModule, DatePipe, CurrencyPipe],
  templateUrl: './movies.html',
  styleUrl: './movies.css'
})
export class Movies implements OnInit {
  private auth = inject(AuthService);
  private movieSvc = inject(MovieService);
  private router = inject(Router);

  movies = signal<Movie[]>([]);
  loading = signal(true);
  errorMsg = signal('');
  search = signal('');
  showModal = signal(false);
  editingMovie = signal<Movie | null>(null);
  currentPage = signal(1);
  readonly pageSize = 6;

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

  totalPages = computed(() => Math.ceil(this.filtered().length / this.pageSize) || 1);

  paginated = computed(() => {
    const start = (this.currentPage() - 1) * this.pageSize;
    return this.filtered().slice(start, start + this.pageSize);
  });

  visiblePages = computed(() => {
    const total = this.totalPages();
    const current = this.currentPage();
    if (total <= 5) return Array.from({ length: total }, (_, i) => i + 1);
    const start = Math.max(1, Math.min(current - 2, total - 4));
    return Array.from({ length: 5 }, (_, i) => start + i);
  });

  constructor() {
    effect(() => {
      const total = this.totalPages();
      if (this.currentPage() > total) this.currentPage.set(total);
    });
  }

  ngOnInit() { this.load(); }

  load() {
    this.loading.set(true);
    this.movieSvc.getAll().subscribe({
      next: data => { this.movies.set(data); this.loading.set(false); },
      error: () => { this.loading.set(false); this.showError('Error al cargar las películas. Intente de nuevo.'); }
    });
  }

  showError(msg: string) {
    this.errorMsg.set(msg);
  }

  clearError() {
    this.errorMsg.set('');
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
    op.subscribe({
      next: () => { this.closeModal(); this.load(); },
      error: () => this.showError('Error al guardar la película. Intente de nuevo.')
    });
  }

  delete(movie: Movie) {
    if (!confirm(`¿Eliminar "${movie.name}"?`)) return;
    this.movieSvc.delete(movie.id).subscribe({
      next: () => this.load(),
      error: () => this.showError('Error al eliminar la película. Intente de nuevo.')
    });
  }

  logout() {
    this.auth.logout();
    this.router.navigate(['/login']);
  }

  onSearchChange(val: string) {
    this.search.set(val);
    this.currentPage.set(1);
  }

  goToPage(n: number) { this.currentPage.set(n); }
  prevPage() { if (this.currentPage() > 1) this.currentPage.update(p => p - 1); }
  nextPage() { if (this.currentPage() < this.totalPages()) this.currentPage.update(p => p + 1); }

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
}

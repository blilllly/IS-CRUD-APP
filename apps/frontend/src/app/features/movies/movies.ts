import { Component, computed, effect, inject, OnDestroy, OnInit, signal } from '@angular/core';
import { Router } from '@angular/router';
import { DatePipe, CurrencyPipe } from '@angular/common';
import { Subscription } from 'rxjs';
import { AuthService } from '../../core/services/auth.service';
import { MovieService } from '../../core/services/movie.service';
import { RealtimeService } from '../../core/services/realtime.service';
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
export class Movies implements OnInit, OnDestroy {
  private auth = inject(AuthService);
  private movieSvc = inject(MovieService);
  private realtime = inject(RealtimeService);
  private router = inject(Router);
  private subs = new Subscription();

  movies = signal<Movie[]>([]);
  loading = signal(true);
  errorMsg = signal('');
  search = signal('');
  statusFilter = signal('');
  sortCol = signal('');
  sortDir = signal<'asc' | 'desc'>('asc');
  showModal = signal(false);
  editingMovie = signal<Movie | null>(null);
  currentPage = signal(1);
  readonly pageSize = 6;

  filtered = computed(() => {
    const q = this.search().toLowerCase();
    const st = this.statusFilter();
    return this.movies().filter(m => {
      const matchesSearch = !q ||
        m.name.toLowerCase().includes(q) ||
        m.category.toLowerCase().includes(q) ||
        m.description.toLowerCase().includes(q);
      const matchesStatus = !st || m.status === st;
      return matchesSearch && matchesStatus;
    });
  });

  sorted = computed(() => {
    const col = this.sortCol();
    const dir = this.sortDir();
    if (!col) return this.filtered();
    return [...this.filtered()].sort((a, b) => {
      let av = (a as any)[col];
      let bv = (b as any)[col];
      if (av == null && bv == null) return 0;
      if (av == null) return 1;
      if (bv == null) return -1;
      if (typeof av === 'string') av = av.toLowerCase();
      if (typeof bv === 'string') bv = bv.toLowerCase();
      const cmp = av > bv ? 1 : av < bv ? -1 : 0;
      return dir === 'asc' ? cmp : -cmp;
    });
  });

  totalPages = computed(() => Math.ceil(this.sorted().length / this.pageSize) || 1);

  paginated = computed(() => {
    const start = (this.currentPage() - 1) * this.pageSize;
    return this.sorted().slice(start, start + this.pageSize);
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

  ngOnInit() {
    this.load();
    this.realtime.connect();
    this.subs.add(
      this.realtime.movieCreated$.subscribe(movie =>
        this.movies.update(list => [movie, ...list])
      )
    );
    this.subs.add(
      this.realtime.movieUpdated$.subscribe(movie =>
        this.movies.update(list => list.map(m => (m.id === movie.id ? movie : m)))
      )
    );
    this.subs.add(
      this.realtime.movieDeleted$.subscribe(id =>
        this.movies.update(list => list.filter(m => m.id !== id))
      )
    );
  }

  ngOnDestroy() {
    this.subs.unsubscribe();
    this.realtime.disconnect();
  }

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
      next: () => this.closeModal(),
      error: () => this.showError('Error al guardar la película. Intente de nuevo.')
    });
  }

  delete(movie: Movie) {
    if (!confirm(`¿Eliminar "${movie.name}"?`)) return;
    this.movieSvc.delete(movie.id).subscribe({
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

  onStatusFilterChange(val: string) {
    this.statusFilter.set(val);
    this.currentPage.set(1);
  }

  toggleSort(col: string) {
    if (this.sortCol() === col) {
      this.sortDir.update(d => d === 'asc' ? 'desc' : 'asc');
    } else {
      this.sortCol.set(col);
      this.sortDir.set('asc');
    }
    this.currentPage.set(1);
  }

  sortIcon(col: string): string {
    if (this.sortCol() !== col) return 'mdi:sort';
    return this.sortDir() === 'asc' ? 'mdi:arrow-up' : 'mdi:arrow-down';
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

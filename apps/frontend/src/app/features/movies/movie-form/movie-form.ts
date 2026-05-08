import { Component, effect, inject, input, output } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Movie, MovieFormData, MovieStatus } from '../../../core/models/movie.model';

@Component({
  selector: 'app-movie-form',
  standalone: true,
  imports: [ReactiveFormsModule],
  templateUrl: './movie-form.html',
  styleUrl: './movie-form.css'
})
export class MovieForm {
  movie = input<Movie | null>(null);
  saved = output<MovieFormData>();
  cancelled = output<void>();

  statuses = Object.values(MovieStatus);

  form = new FormGroup({
    name:        new FormControl('', [Validators.required, Validators.maxLength(200)]),
    category:    new FormControl('', [Validators.required, Validators.maxLength(100)]),
    description: new FormControl('', [Validators.required, Validators.maxLength(1000)]),
    status:      new FormControl<MovieStatus>(MovieStatus.Disponible, Validators.required),
    releaseDate: new FormControl<string | null>(null),
    revenue:     new FormControl<number | null>(null, [Validators.min(0)])
  });

  constructor() {
    effect(() => {
      const m = this.movie();
      if (m) {
        this.form.patchValue({
          name: m.name,
          category: m.category,
          description: m.description,
          status: m.status,
          releaseDate: m.releaseDate ? m.releaseDate.split('T')[0] : null,
          revenue: m.revenue ?? null
        });
      } else {
        this.form.reset({ status: MovieStatus.Disponible });
      }
    });
  }

  get isEditing() { return !!this.movie(); }

  statusLabel(s: string): string {
    const map: Record<string, string> = {
      Disponible: 'Disponible',
      NoDisponible: 'No Disponible',
      Proximamente: 'Próximamente',
      Archivada: 'Archivada'
    };
    return map[s] ?? s;
  }

  submit() {
    if (this.form.invalid) { this.form.markAllAsTouched(); return; }
    const val = this.form.value;
    this.saved.emit({
      name: val.name!,
      category: val.category!,
      description: val.description!,
      status: val.status!,
      releaseDate: val.releaseDate || null,
      revenue: val.revenue != null && val.revenue !== ('' as any) ? Number(val.revenue) : null
    });
  }
}

import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { MovieService } from './movie.service';
import { Movie, MovieFormData, MovieStatus } from '../models/movie.model';

const mockMovie: Movie = {
  id: 1,
  name: 'Inception',
  category: 'Sci-Fi',
  description: 'Un ladrón que roba secretos a través de los sueños.',
  status: MovieStatus.Disponible,
  createdAt: '2024-01-01T00:00:00Z',
  releaseDate: '2010-07-16T00:00:00Z',
  revenue: 836848102
};

const formData: MovieFormData = {
  name: 'Inception',
  category: 'Sci-Fi',
  description: 'Un ladrón que roba secretos a través de los sueños.',
  status: MovieStatus.Disponible,
  releaseDate: '2010-07-16',
  revenue: 836848102
};

describe('MovieService', () => {
  let service: MovieService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()]
    });
    service = TestBed.inject(MovieService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => httpMock.verify());

  it('debería crearse correctamente', () => {
    expect(service).toBeTruthy();
  });

  it('getAll realiza GET a /api/movies y retorna la lista', () => {
    service.getAll().subscribe(movies => {
      expect(movies.length).toBe(1);
      expect(movies[0].name).toBe('Inception');
    });

    const req = httpMock.expectOne(r => r.url.includes('/api/movies') && r.method === 'GET');
    req.flush([mockMovie]);
  });

  it('create realiza POST a /api/movies con los datos del formulario', () => {
    service.create(formData).subscribe(movie => {
      expect(movie.id).toBe(1);
      expect(movie.name).toBe('Inception');
    });

    const req = httpMock.expectOne(r => r.url.includes('/api/movies') && r.method === 'POST');
    expect(req.request.body).toEqual(formData);
    req.flush(mockMovie);
  });

  it('update realiza PUT a /api/movies/:id con los datos actualizados', () => {
    const updated: MovieFormData = { ...formData, name: 'Inception (Director Cut)' };

    service.update(1, updated).subscribe(movie => {
      expect(movie.name).toBe('Inception (Director Cut)');
    });

    const req = httpMock.expectOne(r => r.url.includes('/api/movies/1') && r.method === 'PUT');
    expect(req.request.body).toEqual(updated);
    req.flush({ ...mockMovie, name: 'Inception (Director Cut)' });
  });

  it('delete realiza DELETE a /api/movies/:id', () => {
    service.delete(1).subscribe();

    const req = httpMock.expectOne(r => r.url.includes('/api/movies/1') && r.method === 'DELETE');
    expect(req.request.method).toBe('DELETE');
    req.flush(null);
  });
});

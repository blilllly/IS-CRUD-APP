export enum MovieStatus {
  Disponible = 'Disponible',
  NoDisponible = 'NoDisponible',
  Proximamente = 'Proximamente',
  Archivada = 'Archivada'
}

export interface Movie {
  id: number;
  name: string;
  category: string;
  description: string;
  status: MovieStatus;
  createdAt: string;
  releaseDate?: string;
  revenue?: number;
}

export interface MovieFormData {
  name: string;
  category: string;
  description: string;
  status: MovieStatus;
  releaseDate?: string | null;
  revenue?: number | null;
}

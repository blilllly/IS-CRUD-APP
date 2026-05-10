import { inject, Injectable } from '@angular/core';
import * as signalR from '@microsoft/signalr';
import { Subject } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Movie } from '../models/movie.model';
import { AuthService } from './auth.service';

@Injectable({ providedIn: 'root' })
export class RealtimeService {
  private auth = inject(AuthService);
  private hub!: signalR.HubConnection;

  readonly movieCreated$ = new Subject<Movie>();
  readonly movieUpdated$ = new Subject<Movie>();
  readonly movieDeleted$ = new Subject<number>();

  connect(): void {
    this.hub = new signalR.HubConnectionBuilder()
      .withUrl(environment.hubUrl, {
        accessTokenFactory: () => this.auth.getToken() ?? '',
      })
      .configureLogging(signalR.LogLevel.Information)
      .withAutomaticReconnect()
      .build();

    this.hub.on('MovieCreated', (movie: Movie) => this.movieCreated$.next(movie));
    this.hub.on('MovieUpdated', (movie: Movie) => this.movieUpdated$.next(movie));
    this.hub.on('MovieDeleted', (id: number) => this.movieDeleted$.next(id));

    this.hub.start().catch(err => console.error('[SignalR] connection failed:', err));
  }

  disconnect(): void {
    this.hub?.stop();
  }
}

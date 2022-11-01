import { AuthenticationService } from './authentication.service';

export const createAuthenticationServiceMock = () =>
  jasmine.createSpyObj<AuthenticationService>('AuthenticationService', {
    isAuthenticated: Promise.resolve(false),
    login: Promise.resolve(undefined),
    logout: Promise.resolve(undefined),
    refresh: Promise.resolve(undefined),
  });

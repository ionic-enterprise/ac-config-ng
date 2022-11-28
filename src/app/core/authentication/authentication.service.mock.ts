import { AuthenticationService } from './authentication.service';

export const createAuthenticationServiceMock = () =>
  jasmine.createSpyObj<AuthenticationService>('AuthenticationService', {
    isAuthenticated: Promise.resolve(false),
    canRefresh: Promise.resolve(false),
    login: Promise.resolve(undefined),
    logout: Promise.resolve(undefined),
    refresh: Promise.resolve(undefined),
    getConfig: Promise.resolve(null),
    getFlow: Promise.resolve(null),
    getProvider: Promise.resolve(null),
    setConfig: Promise.resolve(undefined),
  });

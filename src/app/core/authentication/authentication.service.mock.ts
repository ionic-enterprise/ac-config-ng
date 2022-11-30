import { AuthenticationService } from './authentication.service';

export const createAuthenticationServiceMock = () =>
  jasmine.createSpyObj<AuthenticationService>('AuthenticationService', {
    isAuthenticated: Promise.resolve(false),
    canRefresh: Promise.resolve(false),
    login: Promise.resolve(undefined),
    logout: Promise.resolve(undefined),
    refresh: Promise.resolve(undefined),
    getBaseConfig: Promise.resolve(null),
    setBaseConfig: Promise.resolve(undefined),
    getConfig: Promise.resolve(null),
  });

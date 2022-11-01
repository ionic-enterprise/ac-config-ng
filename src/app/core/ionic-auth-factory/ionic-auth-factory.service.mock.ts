import { IonicAuthFactoryService } from './ionic-auth-factory.service';

export const createIonicAuthFactoryServiceMock = () =>
  jasmine.createSpyObj<IonicAuthFactoryService>('IonicAuthFactoryService', {
    create: undefined,
  });

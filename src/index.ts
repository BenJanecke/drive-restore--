import { clientFactory } from './auth';
import { driveFactory, DriveApi } from './drive';

export interface GoogleApi {
  drive: DriveApi,
};

export async function apiFactory(): Promise<GoogleApi> {
  const client = await clientFactory();

  return {
    drive: driveFactory(client),
  };
};
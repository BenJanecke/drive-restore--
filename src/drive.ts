import * as google from 'googleapis';
import { gApiPromise } from './base';

export interface DriveFile {
  id: string,
  name: string,
  description?: string,
  appProperties?: string,
  capabilities?: string,
  contentHints?: string,
  createdTime?: string,
  explicitlyTrashed?: string,
  fileExtension?: string,
  folderColorRgb?: string,
  fullFileExtension?: string,
  headRevisionId?: string,
  iconLink?: string,
  imageMediaMetadata?: string,
  isAppAuthorized?: string,
  kind?: string,
  lastModifyingUser?: string,
  md5Checksum?: string,
  mimeType?: string,
  modifiedByMeTime?: string,
  modifiedTime?: string,
  originalFilename?: string,
  ownedByMe?: string,
  owners?: string,
  parents?: Array<DriveFile>,
  permissions?: string,
  properties?: string,
  quotaBytesUsed?: string,
  shared?: string,
  sharedWithMeTime?: string,
  sharingUser?: string,
  size?: string,
  spaces?: string,
  starred?: string,
  thumbnailLink?: string,
  trashed?: string,
  version?: string,
  videoMediaMetadata?: string,
  viewedByMe?: string,
  viewedByMeTime?: string,
  viewersCanCopyContent?: string,
  webContentLink?: string,
  webViewLink?: string,
  writersCanShare?: string,
};

export interface ListFiles {
  (ipp: number, page: string, query?: string): Promise<ListFileResult>
};

export interface ListFileResult {
  nextPageToken: string,
  files: Array<DriveFile>
};

export function listFiles(auth: any): ListFiles {
  const list = gApiPromise<any>(auth, google.drive('v3').files.list); 
  return (
    ipp: number = 1000, 
    page: string = '',
    query?: string,
  ): Promise<ListFileResult> => {
      return list(Object.assign(
        {}, {
          pageSize: ipp,
          fields: "nextPageToken, files(id, name, parents)"
        }, 
        page ? { pageToken: page } : {},
        query ? { q: query } : {}
      ));
  };
};

export interface FileMeta {
  (fileId: string): Promise<DriveFile>
};

export function fileMeta(auth: any): FileMeta {
  const get = gApiPromise<DriveFile>(auth, google.drive('v3').files.get); 
  return (
    fileId: string
  ) => {
    return get({
      fileId,
      fields: 'appProperties,capabilities,contentHints,createdTime,description,explicitlyTrashed,fileExtension,folderColorRgb,fullFileExtension,headRevisionId,iconLink,id,imageMediaMetadata,isAppAuthorized,kind,lastModifyingUser,md5Checksum,mimeType,modifiedByMeTime,modifiedTime,name,originalFilename,ownedByMe,owners,parents,permissions,properties,quotaBytesUsed,shared,sharedWithMeTime,sharingUser,size,spaces,starred,thumbnailLink,trashed,version,videoMediaMetadata,viewedByMe,viewedByMeTime,viewersCanCopyContent,webContentLink,webViewLink,writersCanShare',
    });
  };
};


export interface FileRevisions {
  (fileId: string): Promise<any>
};

export function fileRevisions(auth: any): FileRevisions {
  const list = gApiPromise<any>(auth, google.drive('v3').revisions.list); 
  return (
    fileId: string
  ) => {
    return list({
      fileId,
    });
  };
};


export interface Copy {
  (file: DriveFile): Promise<DriveFile>
};

export function copy(auth: any): Copy {
  const copy = gApiPromise<DriveFile>(auth, google.drive('v3').files.copy); 
  return (
    file: DriveFile
  ) => {
    return copy({
      fileId: file.id,
      keepForever: true,
    });
  };
};

export interface DriveApi {
  listFiles: ListFiles,
  fileMeta: FileMeta,
  fileRevisions: FileRevisions,
  copy: Copy,
};

export function driveFactory(client: any): DriveApi {
  return {
    listFiles: listFiles(client),
    fileMeta: fileMeta(client),
    fileRevisions: fileRevisions(client),
    copy: copy(client),
  };
};
import { askQuestion } from './questioner';
import * as GoogleAuth from 'google-auth-library';
import { readJson, writeJson } from './json-fs';

interface Credentials {
    client_id: string,
    project_id: string,
    auth_uri: string,
    token_uri: string,
    auth_provider_x509_cert_url: string,
    client_secret: string,
    redirect_uris: Array<string>,
};

async function getToken(client): Promise<any>  {
  const authUrl = client.generateAuthUrl({
    access_type: 'offline',
    scope: [
        'https://www.googleapis.com/auth/drive'
    ],
  });

  console.log('Authorize this app by visiting this url: ', authUrl);
  
  const requestToken = code => new Promise((resolve, reject) => {
    client.getToken(code, function(err, token) {
      if (err) {
        return reject(err);
      }
      return resolve(token);
    });
  });

  const code = await askQuestion('Enter the code from that page here: ');

  return requestToken(code);
};


export async function clientFactory() {
  const credentials: Credentials = await readJson(__dirname + '/credentials.json');

  const auth = new GoogleAuth();
  const client = new auth.OAuth2(
    credentials.client_id, 
    credentials.client_secret, 
    credentials.redirect_uris[0]
  );

  try {
    const token = await readJson(__dirname + '/token');
    client.credentials = token;
    return client;
  } catch (err) {
    const token = await getToken(client);
    await writeJson(__dirname + '/token', token);
    client.credentials = token;
    return client;
  }
};
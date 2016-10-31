import { askQuestion, argOrAsk } from './src/questioner';
import { DriveFile } from './src/drive';
import { apiFactory, GoogleApi } from './src';
import { readJson, writeJson, removeJson } from './src/json-fs';

async function listMeSomeFiles(api: GoogleApi) {
    const ipp = await argOrAsk(3, 'How many items should there be per page: ');
    const page = await argOrAsk(4, 'Which page are we looking at? (leave this empty for the first page): ');
    const query = await argOrAsk(5, 'Anything to search for? (leave this empty if you want errything) https://developers.google.com/drive/v3/web/search-parameters#fn3: ');
    const response = await api.drive.listFiles(
        +ipp, 
        page, 
        query
    );
    console.log(`You asked for ${ipp} items from page ${page} that match ${query}`);
    console.log(`You can find the next page here ${response.nextPageToken}`);
    console.log(response.files);
}

function enbiggenArray(arr: Array<DriveFile>, newItems: Array<DriveFile>) {
    return arr.splice.bind(arr, arr.length, 0).apply(arr, newItems);
};

async function collectSafeFiles(
    api: GoogleApi, 
    page:string = '', 
    iteration: number = 1, 
    files: Array<DriveFile> = []
): Promise<Array<DriveFile>> {
    try {
        const storedFiles = await readJson(__dirname + '/safe.json');
        return storedFiles;
    } catch (err) {          
        console.log(`Iteration: ${iteration}, page: ${page}`)
        
        const response = await api.drive.listFiles(
            1000, 
            page, 
            "modifiedTime <= '2016-10-28T17:11:00' and  mimeType != 'application/vnd.google-apps.folder'"
        );
        
        console.log(`Adding ${response.files.length} files`);

        enbiggenArray(files, response.files);

        if (response.nextPageToken) {
            return collectSafeFiles(
                api, 
                response.nextPageToken, 
                iteration + 1, 
                files
            );
        }

        
        await writeJson(__dirname + '/safe.json', files);

        return files;    
    }

};


async function twentyFiveAtATime(api: GoogleApi, files: Array<DriveFile>) {
    console.log(`${files.length} bottles of beer on the wall`);

    const toTake = files.length < 25 ? files.length : 25;

    console.log(`take ${toTake} down passem around`); 

    await Promise.all(files.slice(0, toTake).map(file => {
        return api.drive.copy(file);
    }));

    if (toTake < 25) {
        return;
    }

    return twentyFiveAtATime(api, files.slice(toTake));
}

async function hope(api: GoogleApi) {
    const files = await collectSafeFiles(api);  

    await twentyFiveAtATime(api, files.filter(file => {
        return file.name.search(/.pdf|.jpg/i) == -1
    }));
}


async function catFile(api: GoogleApi, file: DriveFile) {
    console.log('---FILE---');
    console.log(file);
    try {
        const revisions = await api.drive.fileRevisions(file.id);
        console.log('---REVISIONS---');
        console.log(revisions);
    } catch (err) {
        console.log('^^^ This *File* is a directory ^^^');
    }
};

async function getMeAFile(api: GoogleApi) {
    const fileId = await argOrAsk(3, 'File id plox');
    const file = await api.drive.fileMeta(fileId);
    catFile(api, file);   
};

async function listTillYouDrop(api: GoogleApi, items?: number, page?: string, attempt: number = 1) {
    if (attempt >= 100) {
        console.log('I give up');
        return [];
    };
    console.log(`attempt ${attempt} page ${page}`);
    const response = await api.drive.listFiles(items, page);
    const filtered = response.files.filter((file) => {
        return !file.name.match(/WHAT_|\.thor/gi);
    });
    if (filtered.length <= 0) {
        return listTillYouDrop(api, items, response.nextPageToken, attempt + 1);
    }
    console.log(`Finally after ${attempt} attempts`);
    console.log(`${filtered.length} files remained after your filter out of ${response.files.length} returned items`);
    console.log(filtered);
};

async function main(act?: string, secondAttempt?: boolean) {
    const action = act || await argOrAsk(2, 'What are we getting up to (file|list|hope|forever|?)');

    try {
        const api = await apiFactory();

        switch (action) {
            case 'list':
                await listMeSomeFiles(api);
                break;
            case 'file':
                await getMeAFile(api);
                break;
            case 'hope':
                await hope(api);
                break;
            case 'forever':
                await listTillYouDrop(api, 1000);
                break;
            default:
                console.log("You didin't specify anything so I'm going to blurt out the some files");
                await listMeSomeFiles(api);
                break;
        }
    } catch (err) {
        if (err.message === 'invalid_request' && !secondAttempt) {
            console.log('Token might a wee bit out of date, cleaning up then you can try again');
            await removeJson(__dirname + '/src/token');
            return main(action, true);
        } else {
            throw err;
        }
    }
};

main().then(() => {
    console.log('All done :)');
}).catch(async (err) => {
    console.log(err);
});

export default {
    version: '1.0.0'
};
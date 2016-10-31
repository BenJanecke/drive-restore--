import * as fs from 'fs';

export function readJson(file: string): Promise<any> {
    return new Promise((resolve, reject) => {
        return fs.readFile(file, 'utf-8', (err, content) => {
            if (err) {
                return reject(err);
            }

            return resolve(JSON.parse(content));
        });
    });
};


export function writeJson(file: string, content: any): Promise<void> {
    return new Promise((resolve, reject) => {
        return fs.writeFile(file, JSON.stringify(content), { encoding: 'utf-8' }, (err) => {
            if (err) {
                return reject(err);
            }

            return resolve();
        })
    });
};

export function removeJson(file: string): Promise<void> {
    return new Promise((resolve, reject) => {
        return fs.unlink(file, (err) => {
            if (err) {
                return reject(err);
            }

            return resolve();
        })
    });
};
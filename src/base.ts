export function gApiPromise<T>(
  auth: any, 
  gApiMethod: any, 
  transform?: (response: any) => T
) {
  return (args: any) => {
    return new Promise<T>((resolve, reject) => {
      const request = Object.assign({}, { auth }, args);
      gApiMethod(request, function(err, response) {
        if (err) {
          return reject(err);
        }
        return resolve(response);
      });
    });
  };
};
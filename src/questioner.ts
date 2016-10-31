import * as readline from 'readline';

export function askQuestion(question: string): Promise<string> {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });
  return new Promise<string>((resolve) => {
    rl.question(question, (a: string) => {
      rl.close();
      return resolve(a);
    })
  });
};

export function argOrAsk(index: number, question: string): Promise<string> {
  if (process.argv[index]) {
    return Promise.resolve(process.argv[index]);
  }

  return askQuestion(question)
};
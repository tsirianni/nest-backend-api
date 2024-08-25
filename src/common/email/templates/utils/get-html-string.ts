import * as fs from 'fs';
import * as path from 'path';

export default (htmlFileName: string) => {
  return fs.readFileSync(path.join(__dirname, '../html', htmlFileName), {
    encoding: 'utf-8',
  });
};

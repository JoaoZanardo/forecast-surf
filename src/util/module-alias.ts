import path, * as paht from 'path';
import moduleAlias from 'module-alias';

const files = paht.resolve(__dirname, '../..');

moduleAlias.addAliases({
    '@src': path.join(files, 'src'),
    '@test': path.join(files, 'test')
});
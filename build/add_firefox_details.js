// eslint-disable-next-line @typescript-eslint/no-var-requires
const fs = require('fs');

const extraData = {
    'browser_specific_settings': {
        'gecko': {
            'id': 'info@lerpal.com',
            'strict_min_version': '53.0'
        }
    }
};

const data = JSON.parse(fs.readFileSync('./dist/manifest.json'));

fs.writeFileSync('./dist/manifest.json', JSON.stringify({...data, ...extraData}, null, 4));

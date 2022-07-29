const FileManagerPlugin = require('filemanager-webpack-plugin');

module.exports = {
    name: 'client',
    target: 'web',
    output: {
        filename: 'bundle.js'
    },
    entry: './index.js',
    mode: 'development',
    plugins: [
        new FileManagerPlugin({
            events: {
                onEnd: {
                    copy: [
                        {
                            source: './dist/bundle.js',
                            destination: './public/js/bundle.js',
                            options: {
                                preserveTimestamps: true,
                                overwrite: true,
                            }
                        }
                    ]
                }
            }
        })
    ]
};

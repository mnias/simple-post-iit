import path from 'path';
import webpack from 'webpack';
import HtmlWebpackPlugin from 'html-webpack-plugin';
import MiniCssExtractPlugin from 'mini-css-extract-plugin';
import CopyWebpackPlugin from 'copy-webpack-plugin';

const config = (env: any, argv: { mode: string }): webpack.Configuration => {
    const isProduction = argv.mode === 'production';

    return {
        entry: {
            sidepanel: './src/sidepanel/sidepanel.tsx',
            background: './src/scripts/background.ts',
            contentScript: './src/scripts/contentScript.ts',
        },
        output: {
            path: path.resolve(__dirname, 'dist'),
            filename: '[name].js',
        },
        resolve: {
            extensions: ['.ts', '.js', '.tsx'],
        },
        module: {
            rules: [
                {
                    test: /\.tsx?$/,
                    use: 'ts-loader',
                    exclude: /node_modules/,
                },
                {
                    test: /\.css$/i,
                    use: [MiniCssExtractPlugin.loader, 'css-loader', 'postcss-loader'],
                },
            ],
        },
        plugins: [
            new MiniCssExtractPlugin({
                filename: '[name].css',
            }),
            new HtmlWebpackPlugin({
                filename: 'sidepanel.html',
                template: 'src/sidepanel/sidepanel.html',
                chunks: ['sidepanel'],
            }),
            new CopyWebpackPlugin({
                patterns: [
                    { from: 'src/manifest.json', to: 'manifest.json' },
                    { from: 'images', to: 'images' },
                ],
            }),
        ],
        mode: isProduction ? 'production' : 'development',
        devtool: isProduction ? false : 'inline-source-map',
    };
};

export default config;
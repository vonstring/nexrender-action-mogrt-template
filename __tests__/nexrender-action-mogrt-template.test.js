const extension = require('../index.js');
const url = require('node:url');
const path = require('node:path');

describe('.mogrt extension', () => {
    const defaultParameters = {
        job: {
            template: {
                src: url.pathToFileURL('./assets/ae.mogrt'),
                composition: 'Comp 1',
                dest: path.join(__dirname, './assets/ae.mogrt')
            },
            actions: {},
            assets: []
        },
        settings: {},
        options: {
            essentialParameters: {
                foo: 'bar',
            }
        },
        type: 'predownload'
    }

    let parameters;

    beforeEach(async () => {
        const { temporaryDirectory } = await import('tempy');
        parameters = JSON.parse(JSON.stringify(defaultParameters));
        parameters.job.workpath = temporaryDirectory();
    })

    test('self-adds to postdownload', async () => {
        let job = await extension(...Object.values(parameters));
        console.log(job);

        expect(job.template).toHaveProperty('composition', '__mogrt__');

        expect(job.actions).toEqual(expect.objectContaining({
            prerender: expect.arrayContaining([
                expect.objectContaining({
                    automaticallyAdded: true,
                    module: require.resolve('../index.js')
                })
            ])
        }));

    });

    test('prerender phase', async () => {
        let job = await extension(...Object.values(parameters));
        parameters.type = 'prerender';
        parameters.options = job.actions.prerender[0];
        parameters.job.template.dest = path.join(__dirname, './assets/ae.mogrt');
        job = await extension(...Object.values(parameters));

        expect(job.template).toEqual(expect.objectContaining({
            composition: '__mogrt__',
            extension: 'aep',
            dest: expect.stringMatching(/test\.aep$/)
        }))
    })

    test('throws if added to postdownload', async () => {
        parameters.type = 'postdownload';
        expect(async () => { await extension(...Object.values(parameters)) })
           .rejects.toThrow("'action-mogrt-template' module should be used only in 'predownload' section");
    });
})
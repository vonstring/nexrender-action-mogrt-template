const StreamZip = require('node-stream-zip');
const path = require('path');
const url = require('url');
const fs = require('fs/promises');

module.exports = async (job, settings, options, type) => {
    settings.logger = settings.logger ?? console;
    const jsxUrl = url.pathToFileURL(path.join(__dirname, 'applyEssentialValues.jsx')).toString();
    if (type === 'predownload') {
        if (typeof options.essentialParameters !== 'undefined') {
            job.assets.push({
                src: jsxUrl,
                keyword: '_essential',
                type: 'script',
                parameters: [
                    {
                        key: 'essentialParameters',
                        value: Object.assign({}, options.essentialParameters)
                    }
                ]
            })
        }

        // self-add this module as prerender action as well
        if (!job.actions.prerender) {
            job.actions.prerender = [];
        }
        job.actions.prerender.push(Object.assign({
            module:__filename,
            automaticallyAdded: true
        }, options));
        job.template.composition = '__mogrt__';
        return job;
    } else if (type === 'prerender' && options.automaticallyAdded) {
        if(path.extname(job.template.dest).toLowerCase() != ".mogrt"){
            settings.logger.log(`[${job.uid}] [action-mogrt-template] skipping - template file should have .mogrt extension`);
            return job;
        }    
        
        const mogrt = new StreamZip.async({ file: job.template.dest });
        await mogrt.extract(null, job.workpath);

        const manifest = JSON.parse(await fs.readFile(path.join(job.workpath, 'definition.json')));
        const sourceInfo = Object.values(manifest.sourceInfoLocalized)[0];
        const compName = sourceInfo.name;

        const asset = job.assets.find(a => a.src === jsxUrl);
        asset.parameters.push({
            key: 'composition',
            value: compName
        });
        
        let aegraphic = new StreamZip.async({ file: path.join(job.workpath, 'project.aegraphic') });
        let template;
        aegraphic.on('entry', entry => {
            if (!template && entry.name.toLocaleLowerCase().endsWith('aep')) {
                template = entry;
            }
        })
        await aegraphic.extract(null, job.workpath);

        if(!template){
            return reject(`[${job.uid}] [action-mogrt-template] ERROR - no AE file found in the .mogrt (extension .aep)`);
        }
        let newPath = path.normalize(`${job.workpath}/${template.name}`)

        settings.logger.log(`[${job.uid}] [action-mogrt-template] setting new template path to: ${newPath}`);

        job.template.dest = newPath;
        job.template.extension = "aep";
        return job;
    } else {
        throw Error("'action-mogrt-template' module should be used only in 'predownload' section");
    }
}
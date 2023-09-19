import * as fs from 'node:fs';
import csvToMarkdown from "csv-to-markdown-table";

// @ts-expect-error tsconfig
import { defineNitroPlugin } from '#imports'

export default defineNitroPlugin((nitro: any) => {
    let i = 0;
    const parser = {
        csvToMd(filePath: string, separator: string, rowCount: number): string {
            const normalizedSrc = filePath.replace(/@/g, '.');
            const isAFile = fs.existsSync(normalizedSrc);
            if (isAFile) {
                const content = fs.readFileSync(normalizedSrc, { encoding: 'utf-8' })
                return csvToMarkdown(content, separator, true)
            }
            return `Can not find file ${filePath}`;
        },
        read_csv(filePath: string, separator: string, rowCount: number): string {
            return this.csvToMd(filePath, separator, rowCount);
        }
    }

    nitro.hooks.hook('content:file:beforeParse', (file: any) => {
        if (file._id.endsWith('.md')) {
            i++;
            console.log(file._id, '=-=-=-=-=-=');
            console.log('i', i, '\n');

            const csvMatch = file.body.match(/{{ read_csv([^}]+) }}/);
            if (!csvMatch) {
                return;
            }
            let modifiedBody = file.body;

            for (let csvFunction of csvMatch) {
                let csvFunctionWithContext = csvFunction.replace('read_csv', 'this.read_csv');

                //Сделать регулярку
                function evalInContext(string: string): string {
                    return eval(string);
                }
                const csvResult = evalInContext.apply(parser, [csvFunctionWithContext]);
                const escapedSnippet = csvFunction.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
                modifiedBody = modifiedBody.replace(new RegExp(escapedSnippet, 'g'), csvResult);
            }
            file.body = modifiedBody;
        }
    })
})

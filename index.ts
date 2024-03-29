import Docxtemplater from 'docxtemplater';
import PizZip from 'pizzip'
import fs from 'fs';
import path from 'path';
import {argv} from 'process';
import {config} from './config';
import {DataGetter} from "./data-getter";


let [arg0, arg1, timelogPath] = argv;

class App {
    private template = fs.readFileSync("./KESU_Template.docx", 'binary');
    private month = '';
    private doc: Docxtemplater;
    private result: any = {};

    constructor() {
        this.process().then(() => {
            console.log('done');
        });
    }

    private async process(): Promise<void> {
        let zip = new PizZip(this.template);
        this.doc = new Docxtemplater(zip, {paragraphLoop: true, linebreaks: true});
        this.initResultObject();
        const dataGetter = new DataGetter(this.result);
        await dataGetter.getCurrentMonthData();
        this.generateDoc();
    }

    private initResultObject(): void {
        this.result = {};
        for (let i = 0; i < 31; i++) {
            this.result['place' + (i + 1)] = '';
            this.result['tasks' + (i + 1)] = '';
            this.result['time' + (i + 1)] = '';
            this.result['daysum' + (i + 1)] = '';
        }
    }

    private generateDoc(): void {
        this.doc.render(this.result);
        let buf = this.doc.getZip().generate({type: 'nodebuffer'});
        fs.mkdirSync('KESU', {recursive: true});
        fs.writeFileSync('KESU/' + config.szablonNazwyPlikuWynikowego(this.result.year, this.result.monthNumber), buf);
    }

    // private processTimelog(): void {
    //     let rawRows = this.timelog.toString().split('\n');
    //     let rows: Array<any> = [];
    //     rawRows.forEach((row: any) => {
    //         rows.push(row.split(';'));
    //     });
    //     let iterator = 0;
    //
    //     for (let colIndex = 2; colIndex < rows[0].length - 1; colIndex++) {
    //         let dayTasks = [];
    //         for (let taskRowIndex = 2; taskRowIndex < rows.length - 2; taskRowIndex++) {
    //             let taskTime = rows[taskRowIndex][colIndex];
    //             if (taskTime !== '""') {
    //                 dayTasks.push(rows[taskRowIndex][1]);
    //             }
    //         }
    //         if (dayTasks.length) {
    //             iterator++;
    //             let day = rows[0][colIndex];
    //             let dayNo = parseInt(day.substring(day.length - 2));
    //             this.result['place' + dayNo] = config.domyslneMiejscePracy;
    //             this.result['tasks' + dayNo] = dayTasks.join('\n');
    //             this.result['time' + dayNo] = config.domyslneGodzinyPracy;
    //             this.result['daysum' + dayNo] = config.domyslnyCzasPracy;
    //         }
    //     }
    //
    //     let [y, m] = rows[0][2].split('-');
    //     this.month = m;
    //     this.result.month = months[parseInt(m) - 1];
    //     this.result.year = y;
    //     this.result.sum = iterator;
    // }
}

process.env['NODE_TLS_REJECT_UNAUTHORIZED'] = '0';
new App();
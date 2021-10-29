
import Docxtemplater from 'docxtemplater';
import PizZip from 'pizzip'
import fs from 'fs';
import path from 'path';
import { argv } from 'process';
import { config } from './config';

const months = ['Styczeń', 'Luty', 'Marzec', 'Kwiecień', 'Maj', 'Czerwiec', 'Lipiec', 'Sierpień', 'Wrzesień', 'Październik', 'Listopad', 'Grudzień'];

let [arg0, arg1, timelogPath] = argv;
class App {
    private template = fs.readFileSync(path.resolve(__dirname, "KESU_Template.docx"), 'binary');
    private timelog = fs.readFileSync(path.resolve(__dirname, "timelogs/" + timelogPath));
    private month = '';
    private doc: Docxtemplater;
    private result: any = {};
    constructor() {
        let zip = new PizZip(this.template);
        this.doc = new Docxtemplater(zip, { paragraphLoop: true, linebreaks: true });

        this.initResultObject();
        this.processTimelog();
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
        let buf = this.doc.getZip().generate({ type: 'nodebuffer' });
        fs.mkdirSync(path.resolve(__dirname, 'KESU'), { recursive: true });
        fs.writeFileSync(path.resolve(__dirname, 'KESU/' + config.filenameTemplate(this.result.year, this.month)), buf);
    }

    private processTimelog(): void {
        let rawRows = this.timelog.toString().split('\n');
        let rows: Array<any> = [];
        rawRows.forEach((row) => {
            rows.push(row.split(';'));
        });
        let iterator = 0;

        for (let colIndex = 2; colIndex < rows[0].length - 1; colIndex++) {
            let dayTasks = [];
            for (let taskRowIndex = 2; taskRowIndex < rows.length - 2; taskRowIndex++) {
                let taskTime = rows[taskRowIndex][colIndex];
                if (taskTime !== '""') {
                    dayTasks.push(rows[taskRowIndex][1]);
                }
            }
            if (dayTasks.length) {
                iterator++;
                let day = rows[0][colIndex];
                let dayNo = parseInt(day.substring(day.length - 2));
                this.result['place' + dayNo] = 'Łódź';
                this.result['tasks' + dayNo] = dayTasks.join('\n');
                this.result['time' + dayNo] = '9-17';
                this.result['daysum' + dayNo] = '8';
            }
        }

        let [y, m] = rows[0][2].split('-');
        this.month = m;
        this.result.month = months[parseInt(m) - 1];
        this.result.year = y;
        this.result.sum = iterator;
    }
}

new App();
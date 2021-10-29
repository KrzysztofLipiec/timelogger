"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var docxtemplater_1 = __importDefault(require("docxtemplater"));
var pizzip_1 = __importDefault(require("pizzip"));
var fs_1 = __importDefault(require("fs"));
var process_1 = require("process");
var config_1 = require("./config");
var months = ['Styczeń', 'Luty', 'Marzec', 'Kwiecień', 'Maj', 'Czerwiec', 'Lipiec', 'Sierpień', 'Wrzesień', 'Październik', 'Listopad', 'Grudzień'];
var arg0 = process_1.argv[0], arg1 = process_1.argv[1], timelogPath = process_1.argv[2];
var App = /** @class */ (function () {
    function App() {
        this.template = fs_1.default.readFileSync("./KESU_Template.docx", 'binary');
        this.timelog = fs_1.default.readFileSync("./timelogs/" + timelogPath);
        this.month = '';
        this.result = {};
        var zip = new pizzip_1.default(this.template);
        this.doc = new docxtemplater_1.default(zip, { paragraphLoop: true, linebreaks: true });
        this.initResultObject();
        this.processTimelog();
        this.generateDoc();
    }
    App.prototype.initResultObject = function () {
        this.result = {};
        for (var i = 0; i < 31; i++) {
            this.result['place' + (i + 1)] = '';
            this.result['tasks' + (i + 1)] = '';
            this.result['time' + (i + 1)] = '';
            this.result['daysum' + (i + 1)] = '';
        }
    };
    App.prototype.generateDoc = function () {
        this.doc.render(this.result);
        var buf = this.doc.getZip().generate({ type: 'nodebuffer' });
        fs_1.default.mkdirSync('KESU', { recursive: true });
        fs_1.default.writeFileSync('KESU/' + config_1.config.filenameTemplate(this.result.year, this.month), buf);
    };
    App.prototype.processTimelog = function () {
        var rawRows = this.timelog.toString().split('\n');
        var rows = [];
        rawRows.forEach(function (row) {
            rows.push(row.split(';'));
        });
        var iterator = 0;
        for (var colIndex = 2; colIndex < rows[0].length - 1; colIndex++) {
            var dayTasks = [];
            for (var taskRowIndex = 2; taskRowIndex < rows.length - 2; taskRowIndex++) {
                var taskTime = rows[taskRowIndex][colIndex];
                if (taskTime !== '""') {
                    dayTasks.push(rows[taskRowIndex][1]);
                }
            }
            if (dayTasks.length) {
                iterator++;
                var day = rows[0][colIndex];
                var dayNo = parseInt(day.substring(day.length - 2));
                this.result['place' + dayNo] = 'Łódź';
                this.result['tasks' + dayNo] = dayTasks.join('\n');
                this.result['time' + dayNo] = '9-17';
                this.result['daysum' + dayNo] = '8';
            }
        }
        var _a = rows[0][2].split('-'), y = _a[0], m = _a[1];
        this.month = m;
        this.result.month = months[parseInt(m) - 1];
        this.result.year = y;
        this.result.sum = iterator;
    };
    return App;
}());
new App();

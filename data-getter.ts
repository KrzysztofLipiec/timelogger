import {config} from "./config";
import Redmine from 'node-redmine';
import {IIssue} from "./i-issue";
import {ITimeEntry} from "./i-time-entry";

const months = ['Styczeń', 'Luty', 'Marzec', 'Kwiecień', 'Maj', 'Czerwiec', 'Lipiec', 'Sierpień', 'Wrzesień', 'Październik', 'Listopad', 'Grudzień'];

export class DataGetter {
    private redmine = new (Redmine as any)(config.redmineAddress, {
        apiKey: config.redmineToken
    });

    constructor(private result) {

    }

    public async getCurrentMonthData(): Promise<void> {
        const entries = await this.getEntries();
        const issues = await this.getIssues(entries.map(entry => entry.issue.id));
        let sum = 0;

        entries.forEach((entry) => {
            let [year, month, day] = entry.spent_on.split('-');
            this.result['place' + day] = config.domyslneMiejscePracy;
            this.result['tasks' + day] += issues[entry.issue.id].subject + '\n';
            this.result['time' + day] = config.domyslneGodzinyPracy;
            if (this.result['daysum' + day]) {
                this.result['daysum' + day] = parseFloat(this.result['daysum' + day]) + entry.hours;
            } else {
                this.result['daysum' + day] = entry.hours;
                if (this.result['daysum' + day] === 7.5) {
                    this.result['daysum' + day] = 8;
                    sum += 0.5;
                }
            }
            sum += entry.hours;
        });

        this.result.month = months[(new Date()).getMonth()];
        this.result.year = (new Date()).getFullYear();
        this.result.sum = sum / 8;
    }

    private async getIssues(ids: number[]): Promise<{ [key: string]: IIssue }> {
        const issues: { issues: Array<any> } = await this.callAsync(this.redmine.issues, {
            issue_id: ids.join(','),
            status_id: '*',
            limit: 100
        }) as any;
        return issues.issues.reduce((acc, issue) => {
            acc[issue.id.toString()] = issue;
            return acc;
        }, {}) as { [key: string]: IIssue };
    }

    private async getEntries(): Promise<ITimeEntry[]> {
        try {
            let userResponse = await this.callAsync(this.redmine.current_user, {}) as any;
            let id = userResponse.user.id;
            var date = new Date();
            var firstDay = new Date(date.getFullYear(), date.getMonth(), 1, 12);
            this.result.monthNumber = firstDay.toISOString().split('T')[0].split('-')[1];
            var lastDay = new Date(date.getFullYear(), date.getMonth() + 1, 0, 12);
            let timeEntries = await this.callAsync(this.redmine.time_entries, {
                user_id: id,
                from: firstDay.toISOString().split('T')[0],
                to: lastDay.toISOString().split('T')[0],
                limit: 100,
            });
            return (timeEntries as any).time_entries;
        } catch (e) {
            throw(e);
        }
    }

    private async callAsync(func, params) {
        return new Promise((resolve, reject) => {
            func.bind(this.redmine)(params, (error, data) => {
                if (error) {
                    return reject(error);
                }
                resolve(data);
            });
        });
    }
}
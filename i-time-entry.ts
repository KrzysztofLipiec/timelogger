import {IProject} from "./i-project";
import {IIssue} from "./i-issue";
import {IUser} from "./i-user";
import {IActivity} from "./i-activity";

export interface ITimeEntry {
    id: number,
    project: IProject,
    issue: IIssue,
    user: IUser,
    activity: IActivity,
    hours: number,
    comments: string,
    spent_on: string
}
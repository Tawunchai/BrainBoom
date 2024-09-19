import { CourseInterface } from './ICourse';

export interface PaymentsInterface {
    ID?: number;
    Amount: number;
    EnrollmentDate: string;
    UserID?: number;
    CourseID?: number;
    Course: CourseInterface; 
}
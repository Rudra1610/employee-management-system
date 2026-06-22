import * as z from 'zod';


// Login Form Validation
export const loginSchema = z.object({
    email: z.string()
        .min(1,{ message : 'Email address is required.'})
        .email({ message : 'Please enter a valid official email layout.'}),
    password: z.string()
        .min(1,{ message: 'Password Cannot be Blank.'})
});

// Admin Signup Validation

export const signupSchema = z.object({
    email: z.string()
        .min(1,{ message : 'Official Email is Required.'})
        .email({ message : 'Invalid Email Format.'}),
    name: z.string()
        .min(2,{ message : 'Full Name must contain at least 2 Characters.'}),
    password: z.string()
        .min(6,{ message: 'Account password should be atleast of 6 Characters Long.'}),
    dateOfJoining: z.string()
        .min(1,{ message: 'Official Date of Joining is Required.'}),
    position: z.string()
        .min(1,{ message: 'Position designation is required.'}),
    aadharNumber: z.string()
        .min(1,{ message: 'Aadhar Card Number is Required'})
        .regex(/^\d{12}$/, {message: 'Aadhar must consists of 12 Numbers.'}),
    panNumber: z.string()
        .min(1,{ message: 'Pan Card Number is required.'})
        .regex(/^[A-Z](5)[0-9]{4}[A-Z]{1}$/, {message :'Invalid PAN Format. Must Match necessary alphanumeric layout'})
});

// Leave Registry Validation

export const leaveSchema = z.object({
    type: z.enum(['Sick Leave','Casual Leave','Maternity/Patnernity Leave'], {
        errorMap: () => ({ message: 'Please select a valid Leave Reason,'})
    }),
    startDate: z.string().min(1,{ message: 'Start Date is Required'}),
    endDate : z.string().min(1,{ message: 'End Date is Required'}),
    reason: z.string()
        .min(10,{ message: 'Justification Must have 10 characters'})
        .max(250,{ message: 'Justification Summary Cannot be exceed by 250 character'})
}).refine((data) => new Date(data.endDate)>= new Date(data.startDate),{
    message: "Conclusion date cannot be fall prior to your start date.",
    path: ["endDate"]
});

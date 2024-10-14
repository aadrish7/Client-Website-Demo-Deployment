import type { Schema } from '../resource'
import { generateClient } from "aws-amplify/data";
import { Amplify } from "aws-amplify";
import outputs from "@/amplify_outputs.json";


Amplify.configure(outputs);

const client = generateClient<Schema>();

export const handler: Schema["bulkCreateEmployees"]["functionHandler"] = async (event, context) => {
    
    let employeeArray = event.arguments.employeesArray || [];



    for (let i = 0; i < employeeArray.length; i++) {
        const user: any = colonStringToObject(employeeArray[i] ? String(employeeArray[i]) : '')
        try {
            await client.models.User.create({
                firstName: user.firstName,
                lastName: user.lastName,
                email: user.email,
                dob: user.dob,
                hireDate: user.hireDate,
                gender: user.gender,
                ethnicity: user.ethnicity,
                manager: user.manager,
                location: user.location,
                veteranStatus: user.veteranStatus,
                disabilityStatus: user.disabilityStatus,
                jobLevel: user.jobLevel,
                department: user.department,
                companyId: user.companyId,
                surveyId: user.surveyId, // Store surveyId
                role: 'employee',
              });
        } catch (error) {
          throw new Error(`${error}`);
        }

    }
    
  return `${employeeArray.length} employees created`
};

export function colonStringToObject(input: string): {
    firstName: string,
    lastName: string,
    email: string,
    dob: string,
    hireDate: string,
    gender: string,
    ethnicity: string,
    manager: string,
    location: string,
    veteranStatus: string,
    disabilityStatus: string,
    jobLevel: string,
    department: string,
    companyId: string,
    surveyId: string,
    role: string
  } | null {
  
    // Split the input string by the colon
    const parts = input.split(':');
    
    // Check if the input has the right number of parts (15 for fields + 1 for 'employee')
    if (parts.length !== 16 || parts[15] !== 'employee') {
      throw new Error(`Invalid format: ${input}`);
    }
  
    const [
      firstName,
      lastName,
      email = "",
      dob = "",
      hireDate = "",
      gender = "",
      ethnicity = "",
      manager = "",
      location = "",
      veteranStatus = "",
      disabilityStatus = "",
      jobLevel = "",
      department = "",
      companyId = "",
      surveyId = ""
    ] = parts.map(part => part.trim());
  
    // Throw error if firstName or lastName are missing
    if (!firstName || !lastName) {
      throw new Error(`First name and last name are required fields. Invalid input: ${input}`);
    }
  
    // Return the object using the captured values
    return {
      firstName,
      lastName,
      email,
      dob,
      hireDate,
      gender,
      ethnicity,
      manager,
      location,
      veteranStatus,
      disabilityStatus,
      jobLevel,
      department,
      companyId,
      surveyId,
      role: 'employee' // Hardcoded role
    };
}

  
  
import type { Schema } from '../resource'
import { generateClient } from "aws-amplify/data";
import { Amplify } from "aws-amplify";
import outputs from "@/amplify_outputs.json";


Amplify.configure(outputs);

const client = generateClient<Schema>();

export const handler: Schema["bulkCreateQuestions"]["functionHandler"] = async (event, context) => {
    
    let questionArray = event.arguments.questionArray || [];



    for (let i = 0; i < questionArray.length; i++) {
        const questionObject: any = extractFactorAndQuestionText(questionArray[i] ? String(questionArray[i]) : '')
        
        try {
            await client.models.Question.create({
              factor:  String(questionObject.factor) || '',
              questionText: String(questionObject.questionText) || '',
              disabled: false,
              collectionId: "",
            });
        } catch (error) {
          throw new Error(`${error}`);
        }

    }
    
  return `${questionArray.length} questions created`
};

export function extractFactorAndQuestionText(input: string): { factor: string, questionText: string } | null {
    const regex = /^(.*?):(.*)$/;
    
    const match = input.match(regex);
    
    if (match && match.length === 3) {
        const factor = match[1].trim();
        const questionText = match[2].trim();
        
        return {
            factor,
            questionText,
        };
    } else {
        throw new Error(`No match found or invalid format: ${input}`);  // Throw error if the pattern doesn't match
    }
}
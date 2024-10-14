import type { Schema } from '../resource'
import { generateClient } from "aws-amplify/data";
import { Amplify } from "aws-amplify";
import outputs from "../../../amplify_outputs.json";


Amplify.configure(outputs);

const client = generateClient<Schema>();

export const handler: Schema["bulkCreateSnippets"]["functionHandler"] = async (event, context) => {
    
    let snippetsArray = event.arguments.snippetsArray || [];

    for (let i = 0; i < snippetsArray.length; i++) {
        const snippetObject: any = parseTextToObj(snippetsArray[i] ? String(snippetsArray[i]) : '')
        
        try {
            await client.models.TextSnippet.create({
              factor:  snippetObject.factor,
              score: snippetObject.score,
              snippetText: snippetObject.snippetText,
              type: snippetObject.sanitizedType,
              disabled: false,
              snippetSetId: "",
            });
        } catch (error) {
          throw new Error(`${error}`);
        }
    }
    
  return `${snippetsArray.length} snippets created`
};

export function parseTextToObj(input: string): { factor: string, score: number, snippetText: string, sanitizedType: string } | null {
    // Regular expression to match the structure: factor, score, snippetText, sanitizedType
    const regex = /^([^:]+):(\d+):([^:]+):([^:]+)$/;

    // Execute the regex to capture the parts of the string
    const match = input.match(regex);

    if (match && match.length === 5) {
        const factor = match[1].trim();
        const score = Number(match[2]);
        const snippetText = match[3].trim();
        const sanitizedType = match[4].trim();

        // Array of valid sanitized types
        const validTypes = ["adminoverview", "employeeaggregated", "employeeindividual"];

        // Validate the sanitizedType
        if (!validTypes.includes(sanitizedType)) {
            console.error(`Invalid type: ${sanitizedType}`);
            return null;  // Return null if the type is invalid
        }

        // Return the object if all checks pass
        return {
            factor,
            score,
            snippetText,
            sanitizedType
        };
    } else {
        throw new Error(`Invalid format: ${input}`);  // Throw error if input doesn't match
    }
}
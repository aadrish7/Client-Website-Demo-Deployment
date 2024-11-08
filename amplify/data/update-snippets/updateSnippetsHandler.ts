// import type { Schema } from "../resource";
// import { generateClient } from "aws-amplify/data";
// import { Amplify } from "aws-amplify";
// import outputs from "@/amplify_outputs.json";

// Amplify.configure(outputs);

// const client = generateClient<Schema>();

// export const handler: Schema["bulkCreateSnippets"]["functionHandler"] = async (
//   event,
//   context
// ) => {
//   let snippetsArray = event.arguments.snippetsArray || [];

//   for (let i = 0; i < snippetsArray.length; i++) {
//     const snippetObject: any = parseTextToObj(
//       snippetsArray[i] ? String(snippetsArray[i]) : ""
//     );

//     try {
//       await client.models.TextSnippet.update({
//         id: snippetObject.id, // Use the extracted id
//         disabled: true,
//       });
//     } catch (error) {
//       throw new Error(`Error updating snippet: ${error}`);
//     }
//   }

//   return `${snippetsArray.length} snippets updated`;
// };

// export function parseTextToObj(
//   input: string
// ): {
//   id: string;
//   snippetSetId: string;
//   disabled: boolean;
// } | null {
//   // Regular expression to match: id, snippetSetId, disabled (in this order)
//   const regex = /^([^:]+):([^:]+):([^:]+)$/;

//   // Execute the regex to capture the parts of the string
//   const match = input.match(regex);

//   if (match) {
//     const id = match[1].trim(); // Extract id
//     const snippetSetId = match[2].trim(); // Extract snippetSetId
//     const disabled = match[3].trim().toLowerCase() === "true"; // Parse disabled as boolean (true/false)

//     // Return the object with id, snippetSetId, and disabled
//     return {
//       id,
//       snippetSetId,
//       disabled,
//     };
//   } else {
//     throw new Error(`Invalid format: ${input}`);
//   }
// }

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
//       if (snippetObject.snippetSetId === "") {
//       await client.models.TextSnippet.create({
//         factor: snippetObject.factor,
//         score: snippetObject.score,
//         snippetText: snippetObject.snippetText,
//         type: snippetObject.sanitizedType,
//         disabled: false,
//         snippetSetId: snippetObject.snippetSetId || "", // Now assigning snippetSetId
//       });} else {
//         await client.models.TextSnippet.create({
//           factor: snippetObject.factor,
//           score: snippetObject.score,
//           snippetText: snippetObject.snippetText,
//           type: snippetObject.sanitizedType,
//           disabled: true,
//           snippetSetId: snippetObject.snippetSetId || "", // Now assigning snippetSetId
//         });
//         }
//     } catch (error) {
//       throw new Error(`${error}`);
//     }
//   }

//   return `${snippetsArray.length} snippets created`;
// };

// export function parseTextToObj(
//   input: string
// ): {
//   factor: string;
//   score: number;
//   snippetText: string;
//   sanitizedType: string;
//   snippetSetId: string;
// } | null {
//   // Regular expression to match the structure: factor, score, snippetText, sanitizedType, snippetSetId
//   const regex = /^([^@]+)@(\d+)@([^@]+)@([^@]+)@([^@]+)$/;

//   // Execute the regex to capture the parts of the string
//   const match = input.match(regex);

//   if (match) {
//     const factor = match[1].trim();
//     const score = Number(match[2]);
//     const snippetText = match[3].trim();
//     const sanitizedType = match[4].trim();
//     const snippetSetId = match[5].trim(); // Extract snippetSetId

//     // Array of valid sanitized types
//     const validTypes = [
//       "adminoverview",
//       "employeeaggregated",
//       "employeeindividual",
//     ];

//     // Check if the sanitized type is valid
//     if (!validTypes.includes(sanitizedType)) {
//       throw new Error(`Invalid sanitized type: ${sanitizedType}`);
//     }

//     // Return the object if all checks pass
//     return {
//       factor,
//       score,
//       snippetText,
//       sanitizedType,
//       snippetSetId, // Include snippetSetId in the return object
//     };
//   } else {
//     throw new Error(`Invalid format: ${input}`); // Throw error if input doesn't match
//   }
// }

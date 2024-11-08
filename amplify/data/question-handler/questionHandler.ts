// import type { Schema } from "../resource";
// import { generateClient } from "aws-amplify/data";
// import { Amplify } from "aws-amplify";
// import outputs from "@/amplify_outputs.json";

// Amplify.configure(outputs);

// const client = generateClient<Schema>();

// export const handler: Schema["bulkCreateQuestions"]["functionHandler"] = async (
//   event,
//   context
// ) => {
//   let questionArray = event.arguments.questionArray || [];
//   let finalOutput:any = {};

//   for (let i = 0; i < questionArray.length; i++) {
//     const questionObject: any = extractFactorQuestionAndCollectionId(
//       questionArray[i] ? String(questionArray[i]) : ""
//     );
//     finalOutput[i] = questionObject;

//     try {
//         if (questionObject.collectionId === "") {
//       await client.models.Question.create({
//         factor: String(questionObject.factor) || "",
//         questionText: String(questionObject.questionText) || "",
//         disabled: false,
//         collectionId: String(questionObject.collectionId) || "",
//       });} else {
//         await client.models.Question.create({
//           factor: String(questionObject.factor) || "",
//           questionText: String(questionObject.questionText) || "",
//           disabled: true,
//           collectionId: String(questionObject.collectionId) || "",
//         });
//     }
//     } catch (error) {
//       throw new Error(`${error}`);
//     }
//   }

//   return `${finalOutput} questions created`;
// };

// export function extractFactorQuestionAndCollectionId(
//   input: string
// ): { factor: string; questionText: string; collectionId: string } | null {
//   const regex = /^(.*?):(.*?):(.*)$/; // Updated regex to match three parts: factor, questionText, collectionId

//   const match = input.match(regex);

//   if (match && match.length === 4) { // Adjust match length for three parts
//     const factor = match[1].trim();
//     const questionText = match[2].trim();
//     const collectionId = match[3].trim(); // Extract collectionId

//     return {
//       factor,
//       questionText,
//       collectionId,
//     };
//   } else {
//     throw new Error(`No match found or invalid format: ${input}`); // Throw error if the pattern doesn't match
//   }
// }

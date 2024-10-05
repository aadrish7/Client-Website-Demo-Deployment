import { type ClientSchema, a, defineData } from "@aws-amplify/backend";
import { disable } from "aws-amplify/analytics";

/*== STEP 1 ===============================================================
The section below creates a Todo database table with a "content" field. Try
adding a new "isDone" field as a boolean. The authorization rule below
specifies that any user authenticated via an API key can "create", "read",
"update", and "delete" any "Todo" records.
=========================================================================*/
const schema = a.schema({
  User: a
    .model({
      firstName: a.string().required(),
      lastName: a.string().required(),
      email: a.email(),
      role: a.string().required(),
      dob: a.date(),
      hireDate: a.date(),
      gender: a.string(),
      ethnicity: a.string(),
      manager: a.string(),
      location: a.string(),
      veteranStatus: a.string(),
      disabilityStatus: a.string(),
      jobLevel: a.string(),
      department: a.string(),
      password: a.string(),
      companyId: a.id().required(),
      surveyId: a.id().required(),
    })
    .authorization((allow) => [allow.publicApiKey()]),

  Survey: a
    .model({
      surveyName: a.string().required(),
      collectionId: a.string(),
      snippetSetId: a.string(),
      companyId: a.string(),
      start: a.boolean(),
    })
    .authorization((allow) => [allow.publicApiKey()]),

  SurveyResults: a
    .model({
      surveyId: a.string().required(),
      userId: a.string().required(),
      allanswersjson: a.json().required(),
    })
    .authorization((allow) => [allow.publicApiKey()]),

  AverageSurveyResults: a
    .model({
      surveyId: a.string().required(),
      userId : a.string().required(),
      averageScorejson: a.json().required(),
    })
    .authorization((allow) => [allow.publicApiKey()]),

  Snippet: a
    .model({
      snippetName: a.string(),
    })
    .authorization((allow) => [allow.publicApiKey()]),

  OverviewSnippet: a
    .model({
      snippetName: a.string(),
    })
    .authorization((allow) => [allow.publicApiKey()]),

  Question: a
    .model({
      factor: a.string().required(),
      questionText: a.string().required(),
      options: a.string().array(),
      disabled: a.boolean().default(false),
    })
    .authorization((allow) => [allow.publicApiKey()]),

  Collection: a
    .model({
      name: a.string(),
      tags: a.string(),
      questions: a.string().array(),
    })
    .authorization((allow) => [allow.publicApiKey()]),

  Company: a
    .model({
      companyName: a.string(),
      adminEmail: a.string().required(),
      adminFirstName: a.string().required(),
      adminLastName: a.string().required(),
      adminJobTitle: a.string().required(),
    })
    .authorization((allow) => [allow.publicApiKey()]),

  TextSnippet: a
    .model({
      factor: a.string().required(),
      score: a.integer().required(),
      snippetText: a.string().required(),
      type : a.enum(["admin", "employee", "normal"]),
      disabled: a.boolean().default(false)
,    })
    .authorization((allow) => [allow.publicApiKey()]),
  
  OverviewTextSnippet: a
    .model({
      factor: a.string().required(),
      score: a.integer().required(),
      snippetText: a.string().required(),
    })
    .authorization((allow) => [allow.publicApiKey()]),

  SnippetSet: a
    .model({
      name: a.string(),
      tags: a.string(),
      textSnippets: a.string().array(),
    })
    .authorization((allow) => [allow.publicApiKey()]),
  
  OverviewSnippetSet: a
    .model({
      name: a.string(),
      tags: a.string(),
      textSnippets: a.string().array(),
    })
    .authorization((allow) => [allow.publicApiKey()]),

  FactorImportance: a
    .model({
      factor: a.string().required(),
      surveyId :  a.string().required(),
      userId : a.string().required(),
      score : a.integer().required(),
    })
    .authorization((allow) => [allow.publicApiKey()]),
});

export type Schema = ClientSchema<typeof schema>;

export const data = defineData({
  schema,
  authorizationModes: {
    defaultAuthorizationMode: "apiKey",
    apiKeyAuthorizationMode: {
      expiresInDays: 30,
    },
  },
});

/*== STEP 2 ===============================================================
Go to your frontend source code. From your client-side code, generate a
Data client to make CRUDL requests to your table. (THIS SNIPPET WILL ONLY
WORK IN THE FRONTEND CODE FILE.)

Using JavaScript or Next.js React Server Components, Middleware, Server 
Actions or Pages Router? Review how to generate Data clients for those use
cases: https://docs.amplify.aws/gen2/build-a-backend/data/connect-to-API/
=========================================================================*/

/*
"use client"
import { generateClient } from "aws-amplify/data";
import type { Schema } from "@/amplify/data/resource";

const client = generateClient<Schema>() // use this Data client for CRUDL requests
*/

/*== STEP 3 ===============================================================
Fetch records from the database and use them in your frontend component.
(THIS SNIPPET WILL ONLY WORK IN THE FRONTEND CODE FILE.)
=========================================================================*/

/* For example, in a React component, you can use this snippet in your
  function's RETURN statement */
// const { data: todos } = await client.models.Todo.list()

// return <ul>{todos.map(todo => <li key={todo.id}>{todo.content}</li>)}</ul>

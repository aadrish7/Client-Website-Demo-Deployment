// util/pagination.ts
export const createPaginatedFetchFunctionForUser = (
    client: any,
    filters: any, 
    pageSize: number = 500
  ) => {
    return async (): Promise<any[]> => {
      let allData: any[] = [];
      let nextToken: string | null = null;
      let hasMorePages: boolean = true;
  
      while (hasMorePages) {
        const { data: results, nextToken: newNextToken }: { data: any[]; nextToken: any } = await client.models.User.list({
          filter: filters,
          limit: pageSize,
          nextToken,
        });
  
        allData = [...allData, ...results];
        nextToken = newNextToken;
  
        if (!nextToken || results.length < pageSize) {
          hasMorePages = false;
        }
      }
  
      return allData;
    };
  };

  export const createPaginatedFetchFunctionForSurveyResults = (
    client: any,
    filters: any, 
    pageSize: number = 500
  ) => {
    return async (): Promise<any[]> => {
      let allData: any[] = [];
      let nextToken: string | null = null;
      let hasMorePages: boolean = true;
  
      while (hasMorePages) {
        const { data: results, nextToken: newNextToken }: { data: any[]; nextToken: any } = await client.models.SurveyResults.list({
          filter: filters,
          limit: pageSize,
          nextToken,
        });
  
        allData = [...allData, ...results];
        nextToken = newNextToken;
  
        if (!nextToken || results.length < pageSize) {
          hasMorePages = false;
        }
      }
  
      return allData;
    };
  };

  export const createPaginatedFetchFunctionForSurvey = (
    client: any,
    filters: any, 
    pageSize: number = 500
  ) => {
    return async (): Promise<any[]> => {
      let allData: any[] = [];
      let nextToken: string | null = null;
      let hasMorePages: boolean = true;
  
      while (hasMorePages) {
        const { data: results, nextToken: newNextToken }: { data: any[]; nextToken: any } = await client.models.Survey.list({
          filter: filters,
          limit: pageSize,
          nextToken,
        });
  
        allData = [...allData, ...results];
        nextToken = newNextToken;
  
        if (!nextToken || results.length < pageSize) {
          hasMorePages = false;
        }
      }
  
      return allData;
    };
  };

  export const createPaginatedFetchFunctionForAverageSurveyResults = (
    client: any,
    filters: any, 
    pageSize: number = 500
  ) => {
    return async (): Promise<any[]> => {
      let allData: any[] = [];
      let nextToken: string | null = null;
      let hasMorePages: boolean = true;
  
      while (hasMorePages) {
        const { data: results, nextToken: newNextToken }: { data: any[]; nextToken: any } = await client.models.AverageSurveyResults.list({
          filter: filters,
          limit: pageSize,
          nextToken,
        });
  
        allData = [...allData, ...results];
        nextToken = newNextToken;
  
        if (!nextToken || results.length < pageSize) {
          hasMorePages = false;
        }
      }
  
      return allData;
    };
  };

  export const createPaginatedFetchFunctionForFactorImportance = (
    client: any,
    filters: any, 
    pageSize: number = 500
  ) => {
    return async (): Promise<any[]> => {
      let allData: any[] = [];
      let nextToken: string | null = null;
      let hasMorePages: boolean = true;
  
      while (hasMorePages) {
        const { data: results, nextToken: newNextToken }: { data: any[]; nextToken: any } = await client.models.FactorImportance.list({
          filter: filters,
          limit: pageSize,
          nextToken,
        });
  
        allData = [...allData, ...results];
        nextToken = newNextToken;
  
        if (!nextToken || results.length < pageSize) {
          hasMorePages = false;
        }
      }
  
      return allData;
    };
  };
  

  export const createPaginatedFetchFunctionForCompany = (
    client: any,
    filters: any, 
    pageSize: number = 500
  ) => {
    return async (): Promise<any[]> => {
      let allData: any[] = [];
      let nextToken: string | null = null;
      let hasMorePages: boolean = true;
  
      while (hasMorePages) {
        const { data: results, nextToken: newNextToken }: { data: any[]; nextToken: any } = await client.models.Company.list({
          filter: filters,
          limit: pageSize,
          nextToken,
        });
  
        allData = [...allData, ...results];
        nextToken = newNextToken;
  
        if (!nextToken || results.length < pageSize) {
          hasMorePages = false;
        }
      }
  
      return allData;
    };
  };

  export const createPaginatedFetchFunctionForTextSnippet = (
    client: any,
    filters: any, 
    pageSize: number = 500
  ) => {
    return async (): Promise<any[]> => {
      let allData: any[] = [];
      let nextToken: string | null = null;
      let hasMorePages: boolean = true;
  
      while (hasMorePages) {
        const { data: results, nextToken: newNextToken }: { data: any[]; nextToken: any } = await client.models.TextSnippet.list({
          filter: filters,
          limit: pageSize,
          nextToken,
        });
  
        allData = [...allData, ...results];
        nextToken = newNextToken;
  
        if (!nextToken || results.length < pageSize) {
          hasMorePages = false;
        }
      }
  
      return allData;
    };
  };

  export const createPaginatedFetchFunctionForQuestion = (
    client: any,
    filters: any, 
    pageSize: number = 500
  ) => {
    return async (): Promise<any[]> => {
      let allData: any[] = [];
      let nextToken: string | null = null;
      let hasMorePages: boolean = true;
  
      while (hasMorePages) {
        const { data: results, nextToken: newNextToken }: { data: any[]; nextToken: any } = await client.models.Question.list({
          filter: filters,
          limit: pageSize,
          nextToken,
        });
  
        allData = [...allData, ...results];
        nextToken = newNextToken;
  
        if (!nextToken || results.length < pageSize) {
          hasMorePages = false;
        }
      }
  
      return allData;
    };
  };

  export const createPaginatedFetchFunctionForCollection = (
    client: any,
    filters: any, 
    pageSize: number = 500
  ) => {
    return async (): Promise<any[]> => {
      let allData: any[] = [];
      let nextToken: string | null = null;
      let hasMorePages: boolean = true;
  
      while (hasMorePages) {
        const { data: results, nextToken: newNextToken }: { data: any[]; nextToken: any } = await client.models.Collection.list({
          filter: filters,
          limit: pageSize,
          nextToken,
        });
  
        allData = [...allData, ...results];
        nextToken = newNextToken;
  
        if (!nextToken || results.length < pageSize) {
          hasMorePages = false;
        }
      }
  
      return allData;
    };
  };

  export const createPaginatedFetchFunctionForSnippetSet = (
    client: any,
    filters: any, 
    pageSize: number = 500
  ) => {
    return async (): Promise<any[]> => {
      let allData: any[] = [];
      let nextToken: string | null = null;
      let hasMorePages: boolean = true;
  
      while (hasMorePages) {
        const { data: results, nextToken: newNextToken }: { data: any[]; nextToken: any } = await client.models.SnippetSet.list({
          filter: filters,
          limit: pageSize,
          nextToken,
        });
  
        allData = [...allData, ...results];
        nextToken = newNextToken;
  
        if (!nextToken || results.length < pageSize) {
          hasMorePages = false;
        }
      }
  
      return allData;
    };
  };


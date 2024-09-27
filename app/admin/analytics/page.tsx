"use client";
import React, { useState, useEffect } from "react";
import { generateClient } from "aws-amplify/data";
import { Schema } from "@/amplify/data/resource";
import { Amplify } from "aws-amplify";
import outputs from "@/amplify_outputs.json";
import Header from "@/components/superadminHeader";
import Sidebar from "@/components/superadminSidebar";
import DropdownButton from "@/components/dropDownButton";
import dynamic from "next/dynamic";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense } from "react";

const PieChart = dynamic(() => import("@/components/adminPieChart"), {
  ssr: false,
  loading: () => <div>Loading Graph...</div>,
});

const BarChart = dynamic(() => import("@/components/barChartEmployee"), {
  ssr: false,
  loading: () => <div>Loading Graph...</div>,
});

const StackedBarChart = dynamic(
  () => import("@/components/adminStackedBarChart"),
  {
    ssr: false,
    loading: () => <div>Loading Graph...</div>,
  }
);

const AdminBarChart = dynamic(
  () => import("@/components/adminBarChartQuestions"),
  {
    ssr: false,
    loading: () => <div>Loading Graph...</div>,
  }
);
Amplify.configure(outputs);
const client = generateClient<Schema>();

type RatingData = {
  label: string;
  values: number[];
  color: string;
};

const AdminPage: React.FC = () => {
  const searchParams = useSearchParams();
  const [listOfEmployees, setListOfEmployees] = useState<any[]>([]);
  const [filter, setFilter] = useState<{
    department?: string;
    gender?: string;
  }>({ department: "", gender: "" });
  const [departments, setDepartments] = useState<string[]>([]);
  const [genders, setGenders] = useState<string[]>([]);
  const [allIndividualSurveyResponses, setAllIndividualSurveyResponses] =
    useState<any[]>([]);
  const [allSurveyResponses, setAllSurveyResponses] = useState<any[]>([]);
  const [averageScores, setAverageScores] = useState<{ [key: string]: number }>(
    {}
  );
  const [avgQuesstionScoresArray, setAvgQuestionScoresArray] = useState<{
    [key: string]: number;
  }>({});
  const [selectedFactor, setSelectedFactor] = useState("Psychological Safety");
  const [percentageFactorImportance, setPercentageFactorImportance] = useState<{
    [key: string]: number;
  }>({});
  const [ratingsData, setRatingsData] = useState<RatingData[]>([
    { label: "5", values: [0, 0, 0, 0, 0], color: "#C22D7E" },
    { label: "4", values: [0, 0, 0, 0, 0], color: "#D86393" },
    { label: "3", values: [0, 0, 0, 0, 0], color: "#E58DA4" },
    { label: "2", values: [0, 0, 0, 0, 0], color: "#F4B7C8" },
    { label: "1", values: [0, 0, 0, 0, 0], color: "#F8D1DD" },
  ]);

  const router = useRouter();
  const fetchEmployees = async () => {
    const idOfSurvey = searchParams.get("surveyId") || "";
    const { data: employees } = await client.models.User.list({
      filter: {
        and: [
          {
            surveyId: {
              eq: idOfSurvey,
            },
          },
          {
            role: {
              eq: "employee",
            },
          },
        ],
      },
    });

    if (employees && employees.length > 0) {
      setListOfEmployees(employees);
      const uniqueDepartments = Array.from(
        new Set(
          employees
            .map((employee) => employee.department)
            .filter((dept): dept is string => dept !== null && dept !== "")
        )
      );

      const uniqueGenders = Array.from(
        new Set(
          employees
            .map((employee) => employee.gender)
            .filter(
              (gender): gender is string => gender !== null && gender !== ""
            )
        )
      );

      if (uniqueDepartments.length > 0) {
        setDepartments(uniqueDepartments);
      }
      if (uniqueGenders.length > 0) {
        setGenders(uniqueGenders);
      }
    }
  };
  const preparingDataForStackedBarChart = (
    factorImportanceResponses: { factor: string; score: number }[],
    ratingsData: any[]
  ) => {
    // Step 1: Count the importance responses
    const EachfactorImportanceIndividualCount =
      factorImportanceResponses.reduce((acc, response) => {
        const { factor, score } = response;
        if (!acc[factor]) {
          acc[factor] = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
        }
        acc[factor][score] += 1;

        return acc;
      }, {} as { [factor: string]: { [score: number]: number } });

    console.log("after step 1", EachfactorImportanceIndividualCount);

    // Step 2: Calculate percentages
    const EachfactorImportanceIndividualPercentage = Object.keys(
      EachfactorImportanceIndividualCount
    ).reduce((acc, factor) => {
      const totalResponsesForFactor = Object.values(
        EachfactorImportanceIndividualCount[factor]
      ).reduce((sum, count) => sum + count, 0);

      acc[factor] = Object.keys(
        EachfactorImportanceIndividualCount[factor]
      ).reduce((scoreAcc, score) => {
        scoreAcc[score] = parseFloat(
          (
            (EachfactorImportanceIndividualCount[factor][Number(score)] /
              totalResponsesForFactor) *
            100
          ).toFixed(2)
        );
        return scoreAcc;
      }, {} as { [score: string]: number });

      return acc;
    }, {} as { [factor: string]: { [score: string]: number } });

    console.log("after step 2", EachfactorImportanceIndividualPercentage);

    // Step 3: Map factor scores to ratings data
    const factorWithIndexes: { [key: string]: number } = {
      "Psychological Safety": 0,
      "Growth Satisfaction": 1,
      Purpose: 2,
      Advocacy: 3,
      Alignment: 4,
    };

    if (Object.keys(EachfactorImportanceIndividualPercentage).length === 0) {
      const defaultratings = [
        { label: "5", values: [0, 0, 0, 0, 0], color: "#C22D7E" },
        { label: "4", values: [0, 0, 0, 0, 0], color: "#D86393" },
        { label: "3", values: [0, 0, 0, 0, 0], color: "#E58DA4" },
        { label: "2", values: [0, 0, 0, 0, 0], color: "#F4B7C8" },
        { label: "1", values: [0, 0, 0, 0, 0], color: "#F8D1DD" },
      ];
      setRatingsData(defaultratings);
      return;
    }

    for (const [factor, scores] of Object.entries(
      EachfactorImportanceIndividualPercentage
    )) {
      for (let i = 0; i < ratingsData.length; i++) {
        const label = ratingsData[i].label;
        if (label in scores) {
          ratingsData[i].values[factorWithIndexes[factor]] = scores[label];
        }
      }
    }

    console.log("after step 3", ratingsData);
    setRatingsData(ratingsData);
  };

  const preparingDataForPercentagePieChart = (
    factorImportanceResponses: { factor: string; score: number }[]
  ) => {
    // Step 1: Filter responses to include only those with a score of 5
    const factorImportanceResponsesFiltered = factorImportanceResponses.filter(
      (response) => response.score === 5
    );

    // Step 2: Count occurrences of each factor
    const factorImportanceCount = factorImportanceResponsesFiltered.reduce(
      (acc, response) => {
        if (!acc[response.factor]) {
          acc[response.factor] = 0;
        }
        acc[response.factor] += 1;
        return acc;
      },
      {} as { [key: string]: number }
    );

    // Step 3: Calculate the percentage of each factor
    const totalResponses = factorImportanceResponsesFiltered.length;
    const factorImportancePercentage = Object.keys(
      factorImportanceCount
    ).reduce((acc, factor) => {
      acc[factor] = totalResponses
        ? parseFloat(
            ((factorImportanceCount[factor] / totalResponses) * 100).toFixed(2)
          )
        : 0; // Handle division by zero if totalResponses is 0
      return acc;
    }, {} as { [key: string]: number });

    // Step 4: Update the state with the calculated percentages
    setPercentageFactorImportance(factorImportancePercentage);
  };

  // useEffect(() => {
  //   if (listOfEmployees.length > 0) {
  //     let filtered = listOfEmployees;
  //     if (filter.department) {
  //       filtered = filtered.filter(emp => emp.department === filter.department);
  //     }
  //     if (filter.gender) {
  //       filtered = filtered.filter(emp => emp.gender === filter.gender);
  //     }
  //     console.log("filtered data", filtered);
  //     setListOfEmployees(filtered);
  //   }
  // }, [filter]);

  useEffect(() => {
    //this will set the employees, gender and department
    fetchEmployees();
  }, []);

  const fetchData = async () => {
    const idOfSurvey = searchParams.get("surveyId") || "";
    const { data: surveys } = await client.models.Survey.list({
      filter: {
        id: {
          eq: idOfSurvey,
        },
      },
    });
    if (surveys.length === 0) {
      console.error("No surveys found for company:");
      return;
    }
    const survey = surveys[0];

    var copyListOfEmployees = [...listOfEmployees];
    console.log("listOfEmployees before filtering", listOfEmployees);

    if (filter.department !== "" && filter.gender !== "") {
      let filtered = copyListOfEmployees.filter(
        (emp) => emp.department === filter.department
      );
      filtered = filtered.filter((emp) => emp.gender === filter.gender);
      copyListOfEmployees = filtered;
    } else if (filter.department !== "") {
      let filtered = copyListOfEmployees.filter(
        (emp) => emp.department === filter.department
      );
      copyListOfEmployees = filtered;
    } else if (filter.gender !== "") {
      let filtered = copyListOfEmployees.filter(
        (emp) => emp.gender === filter.gender
      );
      copyListOfEmployees = filtered;
    }

    console.log("listOfEmployees after filtering", copyListOfEmployees);

    const { data: beforeFiltersurveyResponses } =
      await client.models.AverageSurveyResults.list({
        filter: {
          surveyId: {
            eq: survey.id,
          },
        },
      });

    //Average Survey Responses
    const surveyResponses = beforeFiltersurveyResponses.filter((response) =>
      copyListOfEmployees.some((emp) => emp.id === response.userId)
    );

    console.log("AveragesurveyResponses", surveyResponses);

    const { data: beforeFilterfactorImportanceResponses } =
      await client.models.FactorImportance.list({
        filter: {
          surveyId: {
            eq: survey.id,
          },
        },
      });

    //Factor Importance Responses
    const factorImportanceResponses =
      beforeFilterfactorImportanceResponses.filter((response) =>
        copyListOfEmployees.some((emp) => emp.id === response.userId)
      );

    console.log("factorImportanceResponses", factorImportanceResponses);

    preparingDataForStackedBarChart(factorImportanceResponses, ratingsData);

    preparingDataForPercentagePieChart(factorImportanceResponses);

    const { data: beforeFilteringindivdualSurveyResponses } =
      await client.models.SurveyResults.list({
        filter: {
          surveyId: {
            eq: survey.id,
          },
        },
      });

    const indivdualSurveyResponses =
      beforeFilteringindivdualSurveyResponses.filter((response) =>
        copyListOfEmployees.some((emp) => emp.id === response.userId)
      );

    console.log("indivdualSurveyResponses123", indivdualSurveyResponses);

    const tempIndividualSurveyResponses: any[] = [];
    indivdualSurveyResponses.forEach((response) => {
      if (typeof response.allanswersjson === "string") {
        const surveyResponse = JSON.parse(response.allanswersjson);
        tempIndividualSurveyResponses.push(surveyResponse);
      } else {
        console.error(
          "Invalid type for surveyResultsjson:",
          typeof response.allanswersjson
        );
      }
    });
    console.log("tempIndividualSurveyResponses", tempIndividualSurveyResponses);
    setAllIndividualSurveyResponses(tempIndividualSurveyResponses);
    // const currentFactor = selectedFactor;
    // setSelectedFactor(()=>currentFactor);

    const allResponses: any[] = [];
    surveyResponses.forEach((response) => {
      if (typeof response.averageScorejson === "string") {
        const surveyResponse = JSON.parse(response.averageScorejson);
        allResponses.push(surveyResponse);
      } else {
        console.error(
          "Invalid type for averageScorejson:",
          typeof response.averageScorejson
        );
      }
    });
    setAllSurveyResponses(allResponses);

    const totalScores: { [key: string]: { total: number; count: number } } = {};
    allResponses.forEach((response) => {
      Object.keys(response).forEach((factor) => {
        if (!totalScores[factor]) {
          totalScores[factor] = { total: 0, count: 0 };
        }
        totalScores[factor].total += response[factor];
        totalScores[factor].count += 1;
      });
    });

    const avgScores = Object.keys(totalScores).reduce((acc, factor) => {
      acc[factor] = totalScores[factor].total / totalScores[factor].count;
      return acc;
    }, {} as { [key: string]: number });

    setAverageScores(avgScores);
  };

  useEffect(() => {
    if (searchParams.has("surveyId")) {
      fetchData();
    }
  }, [listOfEmployees, filter]);

  useEffect(() => {
    const handleFactorChange = () => {
      if (allIndividualSurveyResponses.length === 0) {
        setAvgQuestionScoresArray({});
        return;
      }

      console.log(`Factor changed to: ${selectedFactor}`);

      const questionIds = [];
      for (let i = 0; i < allIndividualSurveyResponses.length; i++) {
        const response = allIndividualSurveyResponses[i];
        // Check if the key of the response matches the selected factor
        if (response.hasOwnProperty(selectedFactor)) {
          for (let j = 0; j < response[selectedFactor].length; j++) {
            questionIds.push(response[selectedFactor][j].questionId);
          }
        }
      }

      const questionScores: any = {};
      questionIds.forEach((questionId) => {
        let totalScore = 0;
        let count = 0;
        for (let i = 0; i < allIndividualSurveyResponses.length; i++) {
          const response = allIndividualSurveyResponses[i];
          if (response.hasOwnProperty(selectedFactor)) {
            for (let j = 0; j < response[selectedFactor].length; j++) {
              if (response[selectedFactor][j].questionId === questionId) {
                totalScore += Number(response[selectedFactor][j].selection);
                count += 1;
              }
            }
          }
        }
        questionScores[questionId] = totalScore / count;
      });

      setAvgQuestionScoresArray(questionScores);
    };

    handleFactorChange();
  }, [selectedFactor, allIndividualSurveyResponses]);

  const handleDepartmentChange = (selectedDepartment: string) => {
    setAvgQuestionScoresArray(() => ({}));
    setRatingsData(() => [
      { label: "5", values: [0, 0, 0, 0, 0], color: "#C22D7E" },
      { label: "4", values: [0, 0, 0, 0, 0], color: "#D86393" },
      { label: "3", values: [0, 0, 0, 0, 0], color: "#E58DA4" },
      { label: "2", values: [0, 0, 0, 0, 0], color: "#F4B7C8" },
      { label: "1", values: [0, 0, 0, 0, 0], color: "#F8D1DD" },
    ]);
    setPercentageFactorImportance(() => ({}));
    setAverageScores(() => ({}));

    setFilter((prev) => ({ ...prev, department: selectedDepartment }));
  };

  const handleGenderChange = (selectedGender: string) => {
    setAvgQuestionScoresArray(() => ({}));
    setRatingsData(() => [
      { label: "5", values: [0, 0, 0, 0, 0], color: "#C22D7E" },
      { label: "4", values: [0, 0, 0, 0, 0], color: "#D86393" },
      { label: "3", values: [0, 0, 0, 0, 0], color: "#E58DA4" },
      { label: "2", values: [0, 0, 0, 0, 0], color: "#F4B7C8" },
      { label: "1", values: [0, 0, 0, 0, 0], color: "#F8D1DD" },
    ]);
    setPercentageFactorImportance(() => ({}));
    setAverageScores(() => ({}));

    setFilter((prev) => ({ ...prev, gender: selectedGender }));
  };

  const navItems = [
    {
      label: "📦 Overview",
      active: false,
      href: "/admin",
    },
    {
      label: "📊 Analytics",
      active: true,
      href: `/admin/analytics?surveyId=${searchParams.get("surveyId")}`,
    },
    {
      label: "🏢 Employees",
      active: false,
      href: `/admin/employees?surveyId=${searchParams.get("surveyId")}`,
    },
  ].filter((item) => item !== undefined);

  const categories = [
    "Psychological Safety",
    "Growth Satisfaction",
    "Purpose",
    "Advocacy",
    "Alignment",
  ];

  return (
    <div className="h-screen flex flex-col">
      <Header userName="Neil Sims" userEmail="neilsimsemail@example.com" />
      <div className="flex flex-1">
        <Sidebar navItems={navItems} />
        <div className="w-4/5 p-3 bg-gray-50">
          <div className="flex mb-4 space-x-4">
            <div className="flex items-center">
              <label className="mr-2">Department:</label>
              <select
                className="p-2 border border-gray-300 rounded-md"
                onChange={(e) => handleDepartmentChange(e.target.value)}
              >
                <option value="">All</option>
                {departments.map((dept) => (
                  <option key={dept} value={dept}>
                    {dept}
                  </option>
                ))}
              </select>
            </div>
            <div className="flex items-center">
              <label className="mr-2">Gender</label>
              <select
                className="p-2 border border-gray-300 rounded-md"
                onChange={(e) => handleGenderChange(e.target.value)}
              >
                <option value="">All</option>
                {genders.map((gender) => (
                  <option key={gender} value={gender}>
                    {gender}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="border p-4 rounded-sm">
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div className="flex flex-col items-center w-full h-[400px] border-2 border-white rounded-sm p-4 bg-white">
                <h2 className="text-sm font-semibold mb-2">
                  %age of Employees rated each factor as most important
                </h2>
                <div className="w-full h-full">
                  <PieChart data={percentageFactorImportance} />
                </div>
              </div>
              <div className="flex flex-col items-center w-full h-[400px] border-2 border-white rounded-sm p-4 bg-white overflow-hidden">
                <h2 className="text-sm font-semibold mb-2">
                  How important each factor is to employees
                </h2>
                <div className="w-full h-full">
                  <StackedBarChart
                    ratings={ratingsData}
                    categories={categories}
                  />
                </div>
              </div>
              <div className="flex flex-col items-center w-full h-[400px] border-2 border-white rounded-sm p-4 bg-white">
                <h2 className="text-sm font-semibold mb-2">
                  Average Score for each factor
                </h2>
                <div className="w-full h-full">
                  <BarChart data={averageScores} />
                </div>
              </div>
              <div className="flex flex-col items-center w-full h-[400px] border-2 border-white rounded-sm p-4 bg-white">
                <h2 className="text-sm font-semibold mb-2">
                  Average score for specific factor for each question
                </h2>
                <div className="w-full flex justify-end mb-2">
                  <DropdownButton
                    selectedFactor={selectedFactor}
                    setSelectedFactor={setSelectedFactor}
                  />
                </div>
                <div className="w-full h-full">
                  <AdminBarChart data={avgQuesstionScoresArray} />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default function () {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <AdminPage />
    </Suspense>
  );
}

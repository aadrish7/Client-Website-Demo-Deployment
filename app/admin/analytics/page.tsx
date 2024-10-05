"use client";
import React, {
  useState,
  useEffect,
  useLayoutEffect,
  ChangeEvent,
} from "react";
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
  loading: () => <div className="text-center py-4">Loading Graph...</div>,
});

const BarChart = dynamic(() => import("@/components/barChartEmployee"), {
  ssr: false,
  loading: () => <div className="text-center py-4">Loading Graph...</div>,
});

const StackedBarChart = dynamic(
  () => import("@/components/adminStackedBarChart"),
  {
    ssr: false,
    loading: () => <div className="text-center py-4">Loading Graph...</div>,
  }
);
type MultiSelectDropdownProps = {
  label: string;
  options: string[];
  selectedOptions: any;
  onChange: (selected: string[]) => void;
};

const MultiSelectDropdown: React.FC<MultiSelectDropdownProps> = ({
  label,
  options,
  selectedOptions,
  onChange,
}) => {
  const [isOpen, setIsOpen] = useState(false); // State to control dropdown open/close

  const handleCheckboxChange = (event: ChangeEvent<HTMLInputElement>) => {
    const { value, checked } = event.target;
    if (checked) {
      onChange([...selectedOptions, value]);
    } else {
      onChange(selectedOptions.filter((option: any) => option !== value));
    }
  };

  const toggleDropdown = () => {
    setIsOpen(!isOpen); // Toggle dropdown visibility
  };

  // Dynamically determine styles based on selected options
  const isSingleOptionSelected = selectedOptions.length === 1;
  const isMultipleOptionsSelected = selectedOptions.length > 1;

  const buttonClasses = isSingleOptionSelected
    ? "text-blue-500 border-blue-500"
    : isMultipleOptionsSelected
    ? "bg-blue-500 text-white border-blue-500"
    : "text-gray-700 border-gray-300";

  return (
    <div className="relative inline-block text-left w-3/5">
      <div>
        {/* Dropdown Button */}
        <button
          type="button"
          className={`inline-flex justify-between w-3/4 mx-1 rounded-md border shadow-sm px-4 py-2 text-sm font-medium ${buttonClasses}`}
          onClick={toggleDropdown}
        >
          {label}
          <svg
            className={`ml-2 h-5 w-5 transition-transform ${
              isOpen ? "rotate-180" : ""
            }`}
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 20 20"
            fill="currentColor"
            aria-hidden="true"
          >
            <path
              fillRule="evenodd"
              d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
              clipRule="evenodd"
            />
          </svg>
        </button>
      </div>

      {/* Dropdown menu */}
      {isOpen && (
        <div className="origin-top-right absolute z-10 mt-2 w-full rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 focus:outline-none">
          <div className="py-1">
            {options.map((option) => (
              <label key={option} className="flex items-center px-4 py-2">
                <input
                  type="checkbox"
                  value={option}
                  checked={selectedOptions.includes(option)}
                  onChange={handleCheckboxChange}
                />
                <span className="ml-2">{option}</span>
              </label>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
const AdminBarChart = dynamic(
  () => import("@/components/adminBarChartQuestions"),
  {
    ssr: false,
    loading: () => <div className="text-center py-4">Loading Graph...</div>,
  }
);
Amplify.configure(outputs);
const client = generateClient<Schema>();

type RatingData = {
  label: string;
  values: number[];
  color: string;
};
const ageCategories = ["Age 18-24", "Age 25-35", "Age 35-45", "Age 45+"];

const AdminPage: React.FC = () => {
  const searchParams = useSearchParams();
  const [listOfEmployees, setListOfEmployees] = useState<any[]>([]);
  const [filter, setFilter] = useState<{
    department?: string[];
    gender?: string[];
    age?: string[];
    yearsOfService?: string[];
  }>({
    department: [],
    gender: [],
    age: [],
    yearsOfService: [],
  });

  const ageCategories = ["Age 18-24", "Age 25-35", "Age 35-45", "Age 45+"];
  const yearsOfServiceCategories = ["1-3 years", "3-5 years", "5+ years"];

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

  const resetChartData = () => {
    setRatingsData([
      { label: "5", values: [0, 0, 0, 0, 0], color: "#C22D7E" },
      { label: "4", values: [0, 0, 0, 0, 0], color: "#D86393" },
      { label: "3", values: [0, 0, 0, 0, 0], color: "#E58DA4" },
      { label: "2", values: [0, 0, 0, 0, 0], color: "#F4B7C8" },
      { label: "1", values: [0, 0, 0, 0, 0], color: "#F8D1DD" },
    ]);
    setPercentageFactorImportance({});
    setAverageScores({});
    setAvgQuestionScoresArray({});
  };

  useEffect(() => {
    if (searchParams.has("surveyId")) {
      // Reset the chart data before fetching new data
      resetChartData();
      fetchData();
    }
  }, [filter, searchParams]);

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
    console.log(
      "5factorImportanceResponsesFiltered",
      factorImportanceResponsesFiltered
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
  const calculateAge = (dob: string) => {
    const birthDate = new Date(dob);
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    if (
      monthDiff < 0 ||
      (monthDiff === 0 && today.getDate() < birthDate.getDate())
    ) {
      age--;
    }
    return age;
  };

  const calculateYearsOfService = (hireDate: string) => {
    const startDate = new Date(hireDate);
    const today = new Date();
    let years = today.getFullYear() - startDate.getFullYear();
    const monthDiff = today.getMonth() - startDate.getMonth();
    if (
      monthDiff < 0 ||
      (monthDiff === 0 && today.getDate() < startDate.getDate())
    ) {
      years--;
    }
    return years;
  };

  useLayoutEffect(() => {
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

    if (
      filter.department &&
      Array.isArray(filter.department) &&
      filter.department.length > 0
    ) {
      copyListOfEmployees = copyListOfEmployees.filter((emp) =>
        filter.department?.includes(emp.department)
      );
    }

    if (
      filter.gender &&
      Array.isArray(filter.gender) &&
      filter.gender.length > 0
    ) {
      copyListOfEmployees = copyListOfEmployees.filter((emp) =>
        filter.gender?.includes(emp.gender)
      );
    }

    if (filter.age && Array.isArray(filter.age) && filter.age.length > 0) {
      copyListOfEmployees = copyListOfEmployees.filter((emp) => {
        const age = calculateAge(emp.dob);
        return filter.age?.some((ageRange) => {
          if (ageRange === "Age 18-24") return age >= 18 && age <= 24;
          if (ageRange === "Age 25-35") return age >= 25 && age <= 35;
          if (ageRange === "Age 35-45") return age >= 35 && age <= 45;
          if (ageRange === "Age 45+") return age >= 45;
          return false;
        });
      });
    }
    

    if (
      filter.yearsOfService &&
      Array.isArray(filter.yearsOfService) &&
      filter.yearsOfService.length > 0
    ) {
      copyListOfEmployees = copyListOfEmployees.filter((emp) => {
        const yearsOfService = calculateYearsOfService(emp.hireDate);
        return filter.yearsOfService?.some((serviceRange) => {
          if (serviceRange === "1-3 years")
            return yearsOfService >= 1 && yearsOfService <= 3;
          if (serviceRange === "3-5 years")
            return yearsOfService >= 3 && yearsOfService <= 5;
          if (serviceRange === "5+ years") return yearsOfService >= 5;
          return false;
        });
      });
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

  const navItems = [
    {
      label: "📦 Overview",
      active: false,
      href: `/admin/overview?surveyId=${searchParams.get("surveyId")}`,
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
          <div className="flex mb-4 gap-0.5">
            {/* Year of Service Dropdown */}
            <MultiSelectDropdown
              label="Department"
              options={departments}
              selectedOptions={filter.department}
              onChange={(selectedDepartments: any) =>
                setFilter((prev) => ({
                  ...prev,
                  department: selectedDepartments,
                }))
              }
            />

            <MultiSelectDropdown
              label="Gender"
              options={genders}
              selectedOptions={filter.gender}
              onChange={(selectedGenders: any) =>
                setFilter((prev) => ({ ...prev, gender: selectedGenders }))
              }
            />

            <MultiSelectDropdown
              label="Age"
              options={ageCategories}
              selectedOptions={filter.age}
              onChange={(selectedAges: any) =>
                setFilter((prev) => ({ ...prev, age: selectedAges }))
              }
            />

            <MultiSelectDropdown
              label="Years of Service"
              options={yearsOfServiceCategories}
              selectedOptions={filter.yearsOfService}
              onChange={(selectedYearsOfService: any) =>
                setFilter((prev) => ({
                  ...prev,
                  yearsOfService: selectedYearsOfService,
                }))
              }
            />
          </div>

          <div className="border p-4 rounded-sm">
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div className="flex flex-col items-center w-full h-[400px] border-2 border-white rounded-sm p-4 bg-white">
                <h2 className="text-sm font-semibold mb-2">
                  Factor Importance Amongst Employees
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
                  <AdminBarChart
                    data={avgQuesstionScoresArray}
                    factor={selectedFactor}
                  />
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

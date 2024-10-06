import React, { useEffect } from 'react';
import { useRouter, usePathname, useSearchParams } from 'next/navigation';
import useUserStore from '@/store/userStore'; // Adjust the path to your store

const Breadcrumb = () => {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const { companyName, setCompanyName } = useUserStore(); // Get companyId from the store

  if (pathname === '/superadmin') {
    return null;
  }

  const pathArray = pathname.split('/').filter((segment) => segment);
  const isListOfSurveys = pathname.includes('/superadmin/surveys');
  const isOverview = pathname.includes('/superadmin/surveys/survey-details');

  const breadcrumbs = [];

  useEffect(() => {
    const queryCompanyName = searchParams.get('companyName');
    if (queryCompanyName && queryCompanyName !== companyName) {
      setCompanyName(queryCompanyName); 
    }
  }, [searchParams, companyName, setCompanyName]);

  if (pathname === '/superadmin') {
    return null;
  }

  if (isListOfSurveys || isOverview) {
    breadcrumbs.push({ label: 'Companies', path: '/superadmin' });
  }

  if (isListOfSurveys || isOverview) {
    breadcrumbs.push({
      label: 'Survey List',
      path: `/superadmin/surveys?companyName=${companyName}`
    });
  }

  if (isOverview) {
    breadcrumbs.push({ label: 'Survey Details', path: pathname + '?' + searchParams.toString() });
  }

  const handleClick = (path: any) => {
    router.push(path);
  };

  return (
    <nav aria-label="breadcrumb" className="mb-4">
      <ol className="flex space-x-2 text-sm text-gray-600">
        {breadcrumbs.map((breadcrumb, index) => {
          const isLast = index === breadcrumbs.length - 1;
          return (
            <li key={index} className="inline-flex items-center">
              {!isLast ? (
                <>
                  <button
                    onClick={() => handleClick(breadcrumb.path)}
                    className="text-gray-600 hover:text-gray-900 hover:underline text-sm font-normal focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                  >
                    {breadcrumb.label}
                  </button>
                  <span className="mx-2 text-gray-400">{'>'}</span>
                </>
              ) : (
                <span aria-current="page" className="text-gray-900 font-semibold text-sm">
                  {breadcrumb.label}
                </span>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
};

export default Breadcrumb;

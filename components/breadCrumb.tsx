'use client'
import React, { useState, useMemo } from 'react';
import { useRouter, usePathname, useSearchParams } from 'next/navigation';

const Breadcrumb: React.FC = () => {
  const router = useRouter();
  const pathname = usePathname(); // Get the current path
  const searchParams = useSearchParams(); // Get the current search parameters

  // Split the current path into segments and filter out any empty strings
  const pathArray = useMemo(() => pathname.split('/').filter((segment) => segment), [pathname]);

  // Define state to store search params for each breadcrumb segment
  const [breadcrumbParams, setBreadcrumbParams] = useState<{ [key: string]: string }>({});

  // Function to generate the URL for each breadcrumb segment, preserving stored query params for each segment
  const generateBreadcrumbURL = (index: number) => {
    const newPath = '/' + pathArray.slice(0, index + 1).join('/');

    // Retrieve the stored search params for the current segment, or use an empty string if not stored
    const paramsString = breadcrumbParams[newPath] || '';
    const params = new URLSearchParams(paramsString);

    // Append the stored query params to the URL
    return params.toString() ? `${newPath}?${params.toString()}` : newPath;
  };

  // Handle breadcrumb click, storing the current search params for the clicked segment
  const handleBreadcrumbClick = (breadcrumbURL: string, segmentPath: string) => {
    const currentParams = searchParams.toString();

    // Always store the current params for the clicked segment
    setBreadcrumbParams((prevParams) => ({
      ...prevParams,
      [segmentPath]: currentParams, // Update the params for the current segment
    }));

    // Navigate to the breadcrumb URL
    router.push(breadcrumbURL);
  };

  // Return nothing if there is only one breadcrumb item (root)
  if (pathArray.length <= 1) {
    return null; // Don't render breadcrumb if there is only one item
  }

  return (
    <nav aria-label="breadcrumb" className="mb-4">
      <ol className="flex space-x-2 text-sm text-gray-600">
        {/* Map over pathArray to create the breadcrumb trail */}
        {pathArray.map((segment, index) => {
          const isLast = index === pathArray.length - 1;
          const segmentPath = '/' + pathArray.slice(0, index + 1).join('/');
          const breadcrumbURL = generateBreadcrumbURL(index); // Generate the correct URL for each breadcrumb

          return (
            <li key={index} className="inline-flex items-center">
              {!isLast ? (
                <>
                  {/* If not the last breadcrumb, create a clickable link */}
                  <button
                    onClick={() => handleBreadcrumbClick(breadcrumbURL, segmentPath)} // Store params and navigate
                    className="text-gray-600 hover:text-gray-900 hover:underline text-sm font-normal focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                  >
                    {decodeURIComponent(segment.replace(/-/g, ' '))} {/* Decode and beautify segment */}
                  </button>
                  <span className="mx-2 text-gray-400">{'>'}</span> {/* Separator */}
                </>
              ) : (
                // Last breadcrumb is bold and not a link
                <span
                  aria-current="page"
                  className="text-gray-900 font-semibold text-sm"
                >
                  {decodeURIComponent(segment.replace(/-/g, ' '))} {/* Decode and beautify segment */}
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

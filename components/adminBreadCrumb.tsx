import React, { useEffect } from 'react';
import { useRouter, usePathname, useSearchParams } from 'next/navigation';
import useUserStore from '@/store/userStore'; // Adjust the path to your store

const Breadcrumb = () => {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const breadcrumbs = [];
  if (pathname === '/admin') {
    return null;
  }
  else if (pathname.includes("/admin/overview")){
    breadcrumbs.push({ label: 'Home', path: '/admin' });
    breadcrumbs.push({label : "Overview", pathname})
  }
  else if (pathname.includes("/admin/analytics")){
    breadcrumbs.push({ label: 'Home', path: '/admin' });
    breadcrumbs.push({label : "Analytics", pathname})
  }
  else if (pathname.includes("/admin/employees")){
    breadcrumbs.push({ label: 'Home', path: '/admin' });
    breadcrumbs.push({label : "Employees", pathname})
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

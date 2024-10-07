import React from 'react';
import { useRouter, usePathname, useSearchParams } from 'next/navigation';

const Breadcrumb = () => {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const breadcrumbs = [];
  if (pathname === '/superadmin/collections/collection' || pathname === '/superadmin/snippets') {
    return null;
  }
  else if (pathname.includes("/superadmin/collections/collection/collection-details")){
    breadcrumbs.push({ label: 'Collections', path: '/superadmin/collections/collection' });
    breadcrumbs.push({label : "Details", pathname})
  }
  else if (pathname.includes("/superadmin/snippets/snippetset/details")){
    breadcrumbs.push({ label: 'Snippet Sets', path: '/superadmin/snippets/snippetset' });
    breadcrumbs.push({label : "Details", pathname})
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

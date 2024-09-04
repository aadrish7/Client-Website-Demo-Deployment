'use client'
import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import useUserStore from '@/store/userStore';

// This is a higher-order component that checks if the user is logged in and if the user is an admin
const withAuth = (WrappedComponent: React.ComponentType) => {
  return function WithAuth(props: React.ComponentProps<typeof WrappedComponent>) {
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(true);
    const isLoggedIn = useUserStore((state) => state.isLoggedIn);
    const role = useUserStore((state) => state.userRole);
    useEffect(() => {
      if (!isLoggedIn && role !== 'admin' && role!=null) {
        router.push('/auth/signin');
      } else {
        setIsLoading(false);
      }
    }, [isLoggedIn, role, router]);

    if (isLoading) {
      return <div>Loading...</div>;
    }

    if (!isLoggedIn) {
      return <div>
        You are not authorized to access this page
      </div>;
    }

    return <WrappedComponent {...props} />;
  };
};

export default withAuth;
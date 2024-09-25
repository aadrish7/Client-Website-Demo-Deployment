import React from "react";
import dynamic from "next/dynamic";
const StackedBarChart = dynamic(() => import("@/components/adminStackedBarChart"), {
    ssr: false,
    loading: () => <div>Loading Graph...</div>,
  });

const demo : React.FC = () => {
    return (
        <div>
        <StackedBarChart/   >
        </div>
    );
}

export default demo;
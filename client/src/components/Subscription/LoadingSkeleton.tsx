import { memo } from "react";

const LoadingSkeleton: React.FC = () => {
  return (
    <div className="animate-pulse">
      {/* <div className="h-12 bg-gray-200 rounded w-3/4 mx-auto mb-8"></div> */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
        {[...Array(3)].map((_, index) => (
          <div key={index} className="bg-gray-100 p-6 rounded-lg">
            <div className="h-16 w-16 bg-gray-200 rounded-full mx-auto mb-4"></div>
            <div className="h-6 bg-gray-200 rounded w-1/2 mx-auto mb-2"></div>
            <div className="h-4 bg-gray-200 rounded w-3/4 mx-auto mb-4"></div>
            <div className="h-8 bg-gray-200 rounded w-1/4 mx-auto mb-4"></div>
            <div className="space-y-2">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="h-4 bg-gray-200 rounded w-full"></div>
              ))}
            </div>
            <div className="h-10 bg-gray-200 rounded w-full mt-6"></div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default memo(LoadingSkeleton);
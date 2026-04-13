const Skeleton = ({ className = '' }) => (
  <div className={`animate-pulse bg-gray-200 rounded ${className}`} />
);

export const TableSkeleton = ({ rows = 5, cols = 4 }) => (
  <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
    <div className="bg-gray-50 px-6 py-4 border-b border-gray-200">
      <div className="flex gap-4">
        {Array.from({ length: cols }).map((_, i) => (
          <Skeleton key={i} className="flex-1 h-4" />
        ))}
      </div>
    </div>
    <div className="divide-y divide-gray-100">
      {Array.from({ length: rows }).map((_, r) => (
        <div key={r} className="px-6 py-4 flex gap-4">
          {Array.from({ length: cols }).map((_, c) => (
            <Skeleton key={c} className="flex-1 h-4" />
          ))}
        </div>
      ))}
    </div>
  </div>
);

export const CardSkeleton = () => (
  <div className="bg-white rounded-lg border border-gray-200 p-6">
    <div className="flex justify-between mb-4">
      <Skeleton className="w-32 h-6" />
      <Skeleton className="w-12 h-12 rounded-full" />
    </div>
    <Skeleton className="w-full h-4 mb-2" />
    <Skeleton className="w-3/4 h-4" />
  </div>
);

export const DashboardSkeleton = () => (
  <div className="p-6 lg:p-8 space-y-6">
    <div>
      <Skeleton className="w-48 h-8 mb-2" />
      <Skeleton className="w-32 h-4" />
    </div>
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {[1, 2, 3, 4].map(i => <CardSkeleton key={i} />)}
    </div>
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div className="lg:col-span-2 bg-white rounded-lg border border-gray-200 p-6 h-80">
        <Skeleton className="w-40 h-6 mb-4" />
        <Skeleton className="w-full h-64" />
      </div>
      <div className="space-y-6">
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <Skeleton className="w-32 h-6 mb-4" />
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="flex gap-3 mb-3">
              <Skeleton className="w-8 h-8 rounded-lg" />
              <div className="flex-1"><Skeleton className="w-full h-4 mb-1" /><Skeleton className="w-3/4 h-3" /></div>
            </div>
          ))}
        </div>
      </div>
    </div>
  </div>
);

export default Skeleton;

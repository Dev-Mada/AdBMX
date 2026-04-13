import { Users, Briefcase, CheckSquare, Plus } from 'lucide-react';

const EmptyState = ({ 
  icon = 'users', 
  title = 'No hay datos', 
  description = 'Comienza agregando tu primer elemento',
  actionLabel = 'Agregar',
  onAction 
}) => {
  const icons = {
    users: Users,
    briefcase: Briefcase,
    tasks: CheckSquare,
  };

  const Icon = icons[icon] || Users;

  return (
    <div className="flex flex-col items-center justify-center py-16 px-4">
      <div className="w-20 h-20 bg-slate-100 rounded-2xl flex items-center justify-center mb-6">
        <Icon className="w-10 h-10 text-slate-400" />
      </div>
      <h3 className="text-xl font-semibold text-slate-900 mb-2">{title}</h3>
      <p className="text-slate-500 text-center max-w-sm mb-6">{description}</p>
      {onAction && (
        <button
          onClick={onAction}
          className="inline-flex items-center gap-2 bg-blue-600 text-white px-5 py-2.5 rounded-xl font-medium hover:bg-blue-700 transition-colors duration-200 shadow-lg shadow-blue-500/25"
        >
          <Plus size={18} />
          {actionLabel}
        </button>
      )}
    </div>
  );
};

export default EmptyState;

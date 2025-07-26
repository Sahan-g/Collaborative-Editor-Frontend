import { clsx } from 'clsx';
import type { SvgIconComponent } from '@mui/icons-material';

interface ActionCardProps {
  title: string;
  subtitle: string;
  icon: SvgIconComponent;
  borderColor?: string; 
}

export default function ActionCard({
  title,
  subtitle,
  icon: Icon,
  borderColor = 'black-300',

}: ActionCardProps) {
const containerClass = clsx(
  'flex items-center gap-4 p-4 rounded-lg border hover:shadow-md cursor-pointer transition-all bg-white',
  'w-full sm:w-72 md:w-80',
  `border-${borderColor}`
)



  return (
    <div className={containerClass}>
      <div className="text-purple-600 bg-purple-100 p-4  rounded-full">
        <Icon fontSize="medium" />
      </div>
      <div>
        <h3 className="font-semibold text-gray-800">{title}</h3>
        <p className="text-sm text-gray-500">{subtitle}</p>
      </div>
    </div>
  );
}

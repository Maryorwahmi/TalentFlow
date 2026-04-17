import { ReactNode } from 'react';
import { cn } from '@/lib/utils';

interface ButtonProps {
  type?: 'button' | 'submit' | 'reset';
  action?: (e: React.MouseEvent<HTMLButtonElement>) => void;
  icon?: ReactNode;
  btnText?: string;
  iconUrl?: string;
  iconAlt?: string;
  className?: string;
  children?: ReactNode;
  disabled?: boolean;
  variant?: 'primary' | 'secondary' | 'outline';
}

export const Button = ({
  type = 'button',
  action,
  icon,
  btnText,
  iconUrl,
  iconAlt = '',
  className,
  children,
  disabled = false,
  variant = 'primary',
}: ButtonProps) => {
  const baseStyles = 'w-full rounded-lg py-2.5 sm:py-3 px-3 sm:px-4 font-bold text-xs sm:text-sm md:text-base flex items-center justify-center space-x-2 transition shadow-lg cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed';

  const variants = {
    primary: 'bg-[#000066] hover:bg-[#000044] text-white',
    secondary: 'bg-gray-200 hover:bg-gray-300 text-gray-800',
    outline: 'border-2 border-gray-300 hover:bg-gray-50 text-gray-800',
  };

  return (
    <button
      type={type}
      className={cn(baseStyles, variants[variant], className)}
      onClick={action}
      disabled={disabled}
      {...(!btnText && { 'aria-label': iconAlt || 'Button' })}
    >
      {iconUrl && (
        <img src={iconUrl} loading="lazy" alt={iconAlt} className="h-5 w-5" />
      )}
      {btnText && <span>{btnText}</span>}
      {icon && icon}
      {children}
    </button>
  );
};

Button.displayName = 'Button';

export default Button;

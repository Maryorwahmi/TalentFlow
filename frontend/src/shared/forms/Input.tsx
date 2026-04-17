import { Eye, EyeOff, AlertCircle } from 'lucide-react';
import { forwardRef, useId, InputHTMLAttributes, ReactNode } from 'react';
import { cn } from '@/lib/utils';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  showPassword?: boolean;
  setShowPassword?: (value: boolean) => void;
  action?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  error?: string;
  icon?: ReactNode;
  inputLength?: number;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  (
    {
      label,
      type,
      placeholder,
      inputLength,
      showPassword,
      setShowPassword,
      action,
      error,
      icon: _icon,
      ...props
    },
    ref
  ) => {
    const hasError = !!error;
    const inputOnChange = action ?? props.onChange;
    const id = props.id || useId();
    const inputProps = {
      ...props,
      onChange: inputOnChange,
      readOnly:
        props.readOnly ?? (props.value !== undefined && inputOnChange == null ? true : undefined),
    };

    return (
      <div className="relative" style={{ width: inputLength ? `${inputLength}%` : '100%' }}>
        {label && (
          <label htmlFor={id} className="mb-2 block text-xs sm:text-sm font-semibold text-navy-900">
            {label}
          </label>
        )}
        <div className="relative">
          <input
            type={
              showPassword !== undefined && type === 'password'
                ? showPassword
                  ? 'text'
                  : 'password'
                : type
            }
            placeholder={placeholder}
            ref={ref}
            id={id}
            className={cn(
              'relative w-full rounded-lg border-1 px-4 py-3 text-sm sm:text-base outline-none transition',
              hasError ? 'border-red-300 focus:ring-red-500' : 'border-gray-300'
            )}
            {...inputProps}
          />
          {type === 'password' && setShowPassword && (
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
            >
              {showPassword ? (
                <EyeOff size={20} className="text-gray-400" />
              ) : (
                <Eye size={20} className="text-gray-400" />
              )}
            </button>
          )}
          {hasError && (
            <AlertCircle className="absolute right-3 top-1/2 -translate-y-1/2 text-red-500" size={20} />
          )}
        </div>
        {hasError && <p className="mt-1 text-xs text-red-500">{error}</p>}
      </div>
    );
  }
);

Input.displayName = 'Input';

export default Input;

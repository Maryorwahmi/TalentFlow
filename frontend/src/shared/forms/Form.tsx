import { ReactNode } from 'react';

interface FormProps {
  header?: string;
  subText?: string;
  formContent?: ReactNode;
  additionalContent?: ReactNode;
  onSubmit?: (e: React.FormEvent<HTMLFormElement>) => void;
  children?: ReactNode;
}

export const Form = ({
  header,
  subText,
  formContent,
  additionalContent,
  onSubmit,
  children,
}: FormProps) => {
  return (
    <div className="w-full max-w-md space-y-4 sm:space-y-6">
      {(header || subText) && (
        <div className="text-center">
          {header && <h1 className="mb-2 text-xl sm:text-2xl md:text-3xl font-bold text-navy-900">{header}</h1>}
          {subText && <p className="text-xs sm:text-sm md:text-base text-gray-500">{subText}</p>}
        </div>
      )}

      <form
        className="space-y-3 sm:space-y-4"
        onSubmit={(e) => {
          e.preventDefault();
          onSubmit?.(e);
        }}
      >
        {formContent}
        {additionalContent}
        {children}
      </form>
    </div>
  );
};

Form.displayName = 'Form';

export default Form;

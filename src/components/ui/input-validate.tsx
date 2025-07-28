import { useState, useCallback } from "react";
import { Input } from "./input";
import { ZodError, ZodType } from "zod";

const ValidatedInput = ({
  name,
  wasSubmitted,
  errors,
  fieldSchema,
  ...props
}: {
  name: string;
  wasSubmitted?: boolean;
  errors?: string[];
  fieldSchema: ZodType;
  [key: string]: any;
}) => {
  const [value, setValue] = useState("");
  const [touched, setTouched] = useState(false);

  const getErrors = useCallback(() => {
    const validationResult = fieldSchema.safeParse(value);
    return validationResult.success
      ? []
      : validationResult.error.flatten().formErrors;
  }, [fieldSchema, value]);

  const fieldErrors = errors || getErrors();
  const shouldRenderErrors = errors || wasSubmitted || touched;

  const handleBlur = () => setTouched(true);
  const handleChange = (e: any) => setValue(e.currentTarget.value);

  return (
    <div className="w-full flex flex-col gap-1">
      <Input
        id={name}
        name={name}
        onBlur={handleBlur}
        onChange={handleChange}
        className={fieldErrors.length > 0 ? "border-red-500" : ""}
        {...props}
      />
      {shouldRenderErrors && (
        <span className="text-sm text-red-500">
          {fieldErrors && fieldErrors.length > 0 && "*"} {fieldErrors}
        </span>
      )}
    </div>
  );
};
export { ValidatedInput };

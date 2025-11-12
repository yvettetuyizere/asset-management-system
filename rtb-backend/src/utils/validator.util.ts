// src/utils/validator.util.ts
import { validate, ValidationError } from "class-validator";
import { plainToClass } from "class-transformer";

export const validateDto = async <T extends object>(
  dtoClass: new () => T,
  data: any
): Promise<{ isValid: boolean; errors: string[] }> => {
  const dtoInstance = plainToClass(dtoClass, data);
  const errors: ValidationError[] = await validate(dtoInstance);

  if (errors.length > 0) {
    const errorMessages = errors.map((error) =>
      Object.values(error.constraints || {}).join(", ")
    );
    return { isValid: false, errors: errorMessages };
  }

  return { isValid: true, errors: [] };
};

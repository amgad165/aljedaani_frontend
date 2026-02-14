import { getTranslatedField } from './localeHelpers';

/**
 * Automatically translate translatable fields in a data object
 */
export function translateData<T extends Record<string, unknown>>(
  data: T | null | undefined,
  translatableFields: string[] = []
): T | null | undefined {
  if (!data) return data;

  // Default translatable fields (common fields across models)
  const defaultFields = [
    'name',
    'description',
    'title',
    'specialization',
    'education',
    'location',
    'role',
    'review_title',
    'full_story',
    'address',
    'region',
    'main_description',
    'quote_text',
  ];

  const fieldsToTranslate = translatableFields.length > 0 ? translatableFields : defaultFields;

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const translatedData = { ...data } as any;

  // Translate each specified field
  fieldsToTranslate.forEach((field) => {
    if (field in translatedData) {
      translatedData[field] = getTranslatedField(translatedData[field], translatedData[field]);
    }
  });

  // Handle nested objects (like department, branch, doctor relations)
  if ('department' in translatedData && translatedData.department && typeof translatedData.department ===  'object') {
    translatedData.department = {
      ...translatedData.department,
      name: getTranslatedField(translatedData.department.name, translatedData.department.name),
      description: getTranslatedField(translatedData.department.description, translatedData.department.description),
    };
  }

  if ('branch' in translatedData && translatedData.branch && typeof translatedData.branch === 'object') {
    translatedData.branch = {
      ...translatedData.branch,
      name: getTranslatedField(translatedData.branch.name, translatedData.branch.name),
      description: getTranslatedField(translatedData.branch.description, translatedData.branch.description),
      address: getTranslatedField(translatedData.branch.address, translatedData.branch.address),
      region: getTranslatedField(translatedData.branch.region, translatedData.branch.region),
    };
  }

  if ('doctor' in translatedData && translatedData.doctor && typeof translatedData.doctor === 'object') {
    translatedData.doctor = {
      ...translatedData.doctor,
      name: getTranslatedField(translatedData.doctor.name, translatedData.doctor.name),
      specialization: getTranslatedField(translatedData.doctor.specialization, translatedData.doctor.specialization),
      education: getTranslatedField(translatedData.doctor.education, translatedData.doctor.education),
      location: getTranslatedField(translatedData.doctor.location, translatedData.doctor.location),
    };
  }

  return translatedData as T;
}

/**
 * Translate array of data objects
 */
export function translateArray<T extends Record<string, unknown>>(
  data: T[] | null | undefined,
  translatableFields: string[] = []
): T[] | null | undefined {
  if (!data) return data;

  return data.map((item) => translateData(item, translatableFields) || item);
}

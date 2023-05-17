import { writeFile } from 'fs/promises';

export async function storingMissingValues(
  filePath: string,
  missingValues: string[],
  typeOfMissingValues: 'Facilities' | 'Products',
) {
  missingValues.unshift(`Missing ${typeOfMissingValues}`);
  const csv = missingValues.join('\n');
  await writeFile(filePath, csv, 'utf8');
}

/**
 * Script to create Property Management custom objects via GraphQL
 * Run with: npx ts-node scripts/create-pm-objects.ts
 */

import fetch from 'node-fetch';

const API_URL = 'http://localhost:3000/metadata';
const AUTH_TOKEN = process.env.AUTH_TOKEN || '';

interface CreateObjectInput {
  nameSingular: string;
  namePlural: string;
  labelSingular: string;
  labelPlural: string;
  description: string;
  icon: string;
}

interface CreateFieldInput {
  objectMetadataId: string;
  name: string;
  label: string;
  type: string;
  description?: string;
  isNullable?: boolean;
  defaultValue?: any;
  options?: Array<{ value: string; label: string; color: string }>;
}

async function createObject(input: CreateObjectInput): Promise<string> {
  const mutation = `
    mutation CreateObject($input: CreateOneObjectMetadataInput!) {
      createOneObject(input: $input) {
        id
        nameSingular
        namePlural
      }
    }
  `;

  const response = await fetch(API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${AUTH_TOKEN}`,
    },
    body: JSON.stringify({
      query: mutation,
      variables: {
        input: {
          object: input,
        },
      },
    }),
  });

  const result = await response.json();

  if (result.errors) {
    throw new Error(`Failed to create object: ${JSON.stringify(result.errors)}`);
  }

  console.log(`✓ Created object: ${input.labelSingular} (${result.data.createOneObject.id})`);
  return result.data.createOneObject.id;
}

async function createField(input: CreateFieldInput): Promise<void> {
  const mutation = `
    mutation CreateField($input: CreateOneFieldMetadataInput!) {
      createOneField(input: $input) {
        id
        name
        label
      }
    }
  `;

  const response = await fetch(API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${AUTH_TOKEN}`,
    },
    body: JSON.stringify({
      query: mutation,
      variables: {
        input: {
          field: input,
        },
      },
    }),
  });

  const result = await response.json();

  if (result.errors) {
    throw new Error(`Failed to create field: ${JSON.stringify(result.errors)}`);
  }

  console.log(`  ✓ Created field: ${input.label}`);
}

async function main() {
  console.log('Creating Property Management Objects...\n');

  try {
    // 1. Create Property Object
    console.log('1. Creating Property object...');
    const propertyId = await createObject({
      nameSingular: 'property',
      namePlural: 'properties',
      labelSingular: 'Property',
      labelPlural: 'Properties',
      description: 'Physical real estate assets managed by the company',
      icon: 'IconBuilding',
    });

    // Add Property fields
    await createField({
      objectMetadataId: propertyId,
      name: 'name',
      label: 'Name',
      type: 'TEXT',
      isNullable: false,
    });

    await createField({
      objectMetadataId: propertyId,
      name: 'street',
      label: 'Street Address',
      type: 'TEXT',
      isNullable: true,
    });

    await createField({
      objectMetadataId: propertyId,
      name: 'city',
      label: 'City',
      type: 'TEXT',
      isNullable: true,
    });

    await createField({
      objectMetadataId: propertyId,
      name: 'state',
      label: 'State',
      type: 'TEXT',
      isNullable: true,
    });

    await createField({
      objectMetadataId: propertyId,
      name: 'postalCode',
      label: 'Postal Code',
      type: 'TEXT',
      isNullable: true,
    });

    await createField({
      objectMetadataId: propertyId,
      name: 'propertyType',
      label: 'Property Type',
      type: 'SELECT',
      isNullable: true,
      options: [
        { value: 'SF', label: 'Single Family', color: 'blue' },
        { value: 'Duplex', label: 'Duplex', color: 'green' },
        { value: 'MF_2_4', label: 'MF 2-4 Units', color: 'orange' },
        { value: 'MF_5_49', label: 'MF 5-49 Units', color: 'purple' },
        { value: 'MF_50_PLUS', label: 'MF 50+ Units', color: 'red' },
      ],
    });

    await createField({
      objectMetadataId: propertyId,
      name: 'unitCount',
      label: 'Unit Count',
      type: 'NUMBER',
      isNullable: true,
    });

    await createField({
      objectMetadataId: propertyId,
      name: 'status',
      label: 'Status',
      type: 'SELECT',
      isNullable: true,
      options: [
        { value: 'Active', label: 'Active', color: 'green' },
        { value: 'Under_Contract', label: 'Under Contract', color: 'yellow' },
        { value: 'Sold', label: 'Sold', color: 'gray' },
      ],
    });

    await createField({
      objectMetadataId: propertyId,
      name: 'acquisitionDate',
      label: 'Acquisition Date',
      type: 'DATE',
      isNullable: true,
    });

    await createField({
      objectMetadataId: propertyId,
      name: 'acquisitionPrice',
      label: 'Acquisition Price',
      type: 'CURRENCY',
      isNullable: true,
    });

    console.log('\n✅ Successfully created Property object with all fields!\n');
    console.log('Next steps:');
    console.log('1. Refresh your browser');
    console.log('2. Navigate to Settings → Data Model → Objects');
    console.log('3. You should see the Property object');
    console.log('4. Continue creating the remaining objects (Unit, Lease, etc.) through the UI or extend this script');
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

main();

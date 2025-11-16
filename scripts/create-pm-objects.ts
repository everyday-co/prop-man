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
  relationCreationPayload?: {
    targetObjectMetadataId: string;
    targetFieldLabel: string;
    targetFieldIcon: string;
    type: 'ONE_TO_MANY' | 'MANY_TO_ONE';
  };
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

  const fieldInput: any = {
    ...input,
  };

  if (input.relationCreationPayload) {
    fieldInput.relationCreationPayload = input.relationCreationPayload;
  }

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
          field: fieldInput,
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

async function getObjectMetadataId(nameSingular: string): Promise<string> {
  const query = `
    query GetObjects {
      objects(paging: { first: 1000 }) {
        edges {
          node {
            id
            nameSingular
          }
        }
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
      query,
    }),
  });

  const result = await response.json();

  if (result.errors) {
    throw new Error(`Failed to query objects: ${JSON.stringify(result.errors)}`);
  }

  const objects = result.data.objects.edges;
  const object = objects.find(
    (obj: any) => obj.node.nameSingular === nameSingular,
  );

  if (!object) {
    throw new Error(`Object with nameSingular "${nameSingular}" not found`);
  }

  return object.node.id;
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

    // Get existing object IDs for relations
    console.log('Fetching existing object metadata IDs...');
    const personId = await getObjectMetadataId('person');
    const propertyIdForRelations = await getObjectMetadataId('property');
    let unitId: string | undefined;
    let leaseId: string | undefined;

    try {
      unitId = await getObjectMetadataId('unit');
    } catch (e) {
      console.log('  ⚠ Unit object not found, skipping unit relations');
    }

    try {
      leaseId = await getObjectMetadataId('lease');
    } catch (e) {
      console.log('  ⚠ Lease object not found, skipping lease relations');
    }

    // 2. Create Applications Object
    console.log('\n2. Creating Applications object...');
    const applicationId = await createObject({
      nameSingular: 'application',
      namePlural: 'applications',
      labelSingular: 'Application',
      labelPlural: 'Applications',
      description: 'Tenant applications for properties',
      icon: 'IconNotes',
    });

    // Add Applications fields
    await createField({
      objectMetadataId: applicationId,
      name: 'name',
      label: 'Name',
      type: 'TEXT',
      isNullable: false,
    });

    await createField({
      objectMetadataId: applicationId,
      name: 'applicant',
      label: 'Applicant',
      type: 'RELATION',
      isNullable: false,
      relationCreationPayload: {
        targetObjectMetadataId: personId,
        targetFieldLabel: 'Applications',
        targetFieldIcon: 'IconNotes',
        type: 'MANY_TO_ONE',
      },
    });

    await createField({
      objectMetadataId: applicationId,
      name: 'property',
      label: 'Property',
      type: 'RELATION',
      isNullable: false,
      relationCreationPayload: {
        targetObjectMetadataId: propertyIdForRelations,
        targetFieldLabel: 'Applications',
        targetFieldIcon: 'IconNotes',
        type: 'MANY_TO_ONE',
      },
    });

    if (unitId) {
      await createField({
        objectMetadataId: applicationId,
        name: 'unit',
        label: 'Unit',
        type: 'RELATION',
        isNullable: true,
        relationCreationPayload: {
          targetObjectMetadataId: unitId,
          targetFieldLabel: 'Applications',
          targetFieldIcon: 'IconNotes',
          type: 'MANY_TO_ONE',
        },
      });
    }

    await createField({
      objectMetadataId: applicationId,
      name: 'applicationDate',
      label: 'Application Date',
      type: 'DATE',
      isNullable: true,
    });

    await createField({
      objectMetadataId: applicationId,
      name: 'status',
      label: 'Status',
      type: 'SELECT',
      isNullable: true,
      options: [
        { value: 'Draft', label: 'Draft', color: 'gray' },
        { value: 'Submitted', label: 'Submitted', color: 'blue' },
        { value: 'Under_Review', label: 'Under Review', color: 'yellow' },
        { value: 'Approved', label: 'Approved', color: 'green' },
        { value: 'Rejected', label: 'Rejected', color: 'red' },
        { value: 'Withdrawn', label: 'Withdrawn', color: 'gray' },
      ],
    });

    await createField({
      objectMetadataId: applicationId,
      name: 'desiredMoveInDate',
      label: 'Desired Move-In Date',
      type: 'DATE',
      isNullable: true,
    });

    await createField({
      objectMetadataId: applicationId,
      name: 'monthlyIncome',
      label: 'Monthly Income',
      type: 'CURRENCY',
      isNullable: true,
    });

    await createField({
      objectMetadataId: applicationId,
      name: 'creditScore',
      label: 'Credit Score',
      type: 'NUMBER',
      isNullable: true,
    });

    await createField({
      objectMetadataId: applicationId,
      name: 'employmentStatus',
      label: 'Employment Status',
      type: 'SELECT',
      isNullable: true,
      options: [
        { value: 'Employed', label: 'Employed', color: 'green' },
        { value: 'Self_Employed', label: 'Self-Employed', color: 'blue' },
        { value: 'Unemployed', label: 'Unemployed', color: 'red' },
        { value: 'Student', label: 'Student', color: 'purple' },
        { value: 'Retired', label: 'Retired', color: 'gray' },
      ],
    });

    await createField({
      objectMetadataId: applicationId,
      name: 'currentAddress',
      label: 'Current Address',
      type: 'TEXT',
      isNullable: true,
    });

    await createField({
      objectMetadataId: applicationId,
      name: 'references',
      label: 'References',
      type: 'TEXT',
      isNullable: true,
    });

    await createField({
      objectMetadataId: applicationId,
      name: 'notes',
      label: 'Notes',
      type: 'TEXT',
      isNullable: true,
    });

    await createField({
      objectMetadataId: applicationId,
      name: 'screeningCompleted',
      label: 'Screening Completed',
      type: 'BOOLEAN',
      isNullable: true,
      defaultValue: false,
    });

    await createField({
      objectMetadataId: applicationId,
      name: 'screeningDate',
      label: 'Screening Date',
      type: 'DATE',
      isNullable: true,
    });

    await createField({
      objectMetadataId: applicationId,
      name: 'decisionDate',
      label: 'Decision Date',
      type: 'DATE',
      isNullable: true,
    });

    await createField({
      objectMetadataId: applicationId,
      name: 'decisionNotes',
      label: 'Decision Notes',
      type: 'TEXT',
      isNullable: true,
    });

    if (leaseId) {
      await createField({
        objectMetadataId: applicationId,
        name: 'relatedLease',
        label: 'Related Lease',
        type: 'RELATION',
        isNullable: true,
        relationCreationPayload: {
          targetObjectMetadataId: leaseId,
          targetFieldLabel: 'Application',
          targetFieldIcon: 'IconNotes',
          type: 'MANY_TO_ONE',
        },
      });
    }

    console.log('\n✅ Successfully created Applications object with all fields!\n');

    // 3. Create Showings Object
    console.log('3. Creating Showings object...');
    const showingId = await createObject({
      nameSingular: 'showing',
      namePlural: 'showings',
      labelSingular: 'Showing',
      labelPlural: 'Showings',
      description: 'Property showings for prospects',
      icon: 'IconKey',
    });

    // Add Showings fields
    await createField({
      objectMetadataId: showingId,
      name: 'name',
      label: 'Name',
      type: 'TEXT',
      isNullable: false,
    });

    await createField({
      objectMetadataId: showingId,
      name: 'property',
      label: 'Property',
      type: 'RELATION',
      isNullable: false,
      relationCreationPayload: {
        targetObjectMetadataId: propertyIdForRelations,
        targetFieldLabel: 'Showings',
        targetFieldIcon: 'IconKey',
        type: 'MANY_TO_ONE',
      },
    });

    if (unitId) {
      await createField({
        objectMetadataId: showingId,
        name: 'unit',
        label: 'Unit',
        type: 'RELATION',
        isNullable: true,
        relationCreationPayload: {
          targetObjectMetadataId: unitId,
          targetFieldLabel: 'Showings',
          targetFieldIcon: 'IconKey',
          type: 'MANY_TO_ONE',
        },
      });
    }

    await createField({
      objectMetadataId: showingId,
      name: 'prospect',
      label: 'Prospect',
      type: 'RELATION',
      isNullable: false,
      relationCreationPayload: {
        targetObjectMetadataId: personId,
        targetFieldLabel: 'Showings',
        targetFieldIcon: 'IconKey',
        type: 'MANY_TO_ONE',
      },
    });

    await createField({
      objectMetadataId: showingId,
      name: 'scheduledDate',
      label: 'Scheduled Date',
      type: 'DATE_TIME',
      isNullable: true,
    });

    await createField({
      objectMetadataId: showingId,
      name: 'status',
      label: 'Status',
      type: 'SELECT',
      isNullable: true,
      options: [
        { value: 'Scheduled', label: 'Scheduled', color: 'blue' },
        { value: 'Completed', label: 'Completed', color: 'green' },
        { value: 'Cancelled', label: 'Cancelled', color: 'red' },
        { value: 'No_Show', label: 'No-Show', color: 'orange' },
        { value: 'Rescheduled', label: 'Rescheduled', color: 'yellow' },
      ],
    });

    await createField({
      objectMetadataId: showingId,
      name: 'showingType',
      label: 'Showing Type',
      type: 'SELECT',
      isNullable: true,
      options: [
        { value: 'In_Person', label: 'In-Person', color: 'blue' },
        { value: 'Virtual', label: 'Virtual', color: 'purple' },
        { value: 'Self_Guided', label: 'Self-Guided', color: 'green' },
      ],
    });

    await createField({
      objectMetadataId: showingId,
      name: 'showingAgent',
      label: 'Showing Agent',
      type: 'RELATION',
      isNullable: true,
      relationCreationPayload: {
        targetObjectMetadataId: personId,
        targetFieldLabel: 'Showings Conducted',
        targetFieldIcon: 'IconKey',
        type: 'MANY_TO_ONE',
      },
    });

    await createField({
      objectMetadataId: showingId,
      name: 'notes',
      label: 'Notes',
      type: 'TEXT',
      isNullable: true,
    });

    await createField({
      objectMetadataId: showingId,
      name: 'prospectInterest',
      label: 'Prospect Interest',
      type: 'SELECT',
      isNullable: true,
      options: [
        { value: 'High', label: 'High', color: 'green' },
        { value: 'Medium', label: 'Medium', color: 'yellow' },
        { value: 'Low', label: 'Low', color: 'orange' },
        { value: 'Not_Interested', label: 'Not Interested', color: 'red' },
      ],
    });

    await createField({
      objectMetadataId: showingId,
      name: 'followUpDate',
      label: 'Follow-Up Date',
      type: 'DATE',
      isNullable: true,
    });

    await createField({
      objectMetadataId: showingId,
      name: 'followUpNotes',
      label: 'Follow-Up Notes',
      type: 'TEXT',
      isNullable: true,
    });

    await createField({
      objectMetadataId: showingId,
      name: 'relatedApplication',
      label: 'Related Application',
      type: 'RELATION',
      isNullable: true,
      relationCreationPayload: {
        targetObjectMetadataId: applicationId,
        targetFieldLabel: 'Showing',
        targetFieldIcon: 'IconKey',
        type: 'MANY_TO_ONE',
      },
    });

    console.log('\n✅ Successfully created Showings object with all fields!\n');
    console.log('\n✅ Successfully created all Property Management objects!\n');
    console.log('Next steps:');
    console.log('1. Refresh your browser');
    console.log('2. Navigate to Settings → Data Model → Objects');
    console.log('3. You should see Property, Applications, and Showings objects');
    console.log('4. Run: npx nx run twenty-front:graphql:generate');
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

main();

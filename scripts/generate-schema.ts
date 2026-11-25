import { mkdirSync, writeFileSync } from 'node:fs';
import { ProjectJsonSchema } from '../schema/project.schema';

console.log('Generating JSON schema for project.json...');
mkdirSync('public/schema', { recursive: true });
writeFileSync('public/schema/project.json', JSON.stringify(ProjectJsonSchema, null, 2) + '\n');
console.log('Done!');

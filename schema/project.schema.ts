/**
 * @file This file contains the JSON schema for the project.json file.
 */

import { z } from 'zod';

/**
 * SemVer Schema
 *
 * This schema defines the structure of a semantic versioning (SemVer) string.
 */
const SemverSchema = z
  .string()
  .trim()
  .regex(/^v?\d+\.\d+\.\d+(?:-[0-9A-Za-z.-]+)?$/, {
    message: 'Expected semantic version (e.g., 1.2.3 or v1.2.3)',
  });

/**
 * URL Schema
 *
 * This schema defines the structure of a valid URL string.
 */
const UrlSchema = z.httpUrl().trim();

/**
 * GitUrl Schema
 *
 * This schema defines the structure of a valid Git URL string.
 */
const GitUrlSchema = z
  .string()
  .trim()
  .regex(
    /^(?:(?:https?|ssh|git):\/\/(?:[^@\s/]+@)?[^/\s:]+(?::\d+)?\/|[^@\s/:]+@[^/\s:]+:)[^\s#?]+?(?:\.git)?(?:\/?#[^\s]*)?$/i,
    {
      message:
        'Expected a valid Git URL (e.g., https://github.com/user/repo.git or git@github.com:user/repo.git)',
    },
  );

/**
 * Git Tag Schema
 *
 * This schema defines the structure of a valid Git tag string.
 */
const GitTagSchema = z.string().trim().min(1, 'Git tag or branch cannot be empty');

/**
 * Project Name
 *
 * This schema defines the structure of a valid project name string.
 * It must be a non-empty string that starts with a letter and can contain letters, numbers,
 * hyphens, and underscores. Maximum length is 50 characters.
 */
const ProjectNameSchema = z
  .string()
  .trim()
  .min(1, 'Project name cannot be empty')
  .max(50, 'Project name must be at most 50 characters long')
  .regex(/^[a-zA-Z][a-zA-Z0-9_-]*$/, {
    message:
      'Project name must start with a letter and can contain letters, numbers, hyphens, and underscores',
  });

/**
 * Project Description
 *
 * This schema defines the structure of a valid project description string.
 * It must be a non-empty string with a maximum length of 150 characters.
 */
const ProjectDescriptionSchema = z
  .string()
  .trim()
  .min(1, 'Project description cannot be empty')
  .max(150, 'Project description must be at most 150 characters long');

/**
 * Project Language Schema
 *
 * This schema defines the structure of a valid project language string.
 */
const ProjectLanguageSchema = z.enum([
  'C',
  'CXX',
  'CUDA',
  'OBJC',
  'OBJCXX',
  'Fortran',
  'HIP',
  'ISPC',
  'Swift',
  'CSharp',
  'Java',
  'ASM',
  'ASM_NASM',
  'ASM_MASM',
  'ASM_ATT',
  'ASM-ATT',
  'NONE',
]);

/**
 * Project CXX Standard Schema
 *
 * This schema defines the structure of a valid C++ standard string.
 */
const ProjectCxxStandardSchema = z.enum(['98', '11', '14', '17', '20', '23', '26']);

/**
 * CMake Option
 *
 * This schema defines the structure of a CMake option object.
 * Each option must have a name and value. The description is optional.
 */
const CMakeOptionSchema = z
  .string()
  .trim()
  .min(1, 'CMake option cannot be empty')
  .regex(
    /^[A-Za-z0-9_-]+=[^=\s]+$/,
    'Expected format OptionName=OptionValue (e.g., BUILD_SHARED_LIBS=ON)',
  );

/**
 * Module Dependency Entry Schema
 *
 * This schema defines the structure of a module (first-party) dependency entry object.
 * Each module must have a name and version.
 */
const ModuleDependencyEntrySchema = z.object({
  name: z.string().trim().min(1, 'Dependency name cannot be empty'),
  version: SemverSchema,
  cmake_options: z.array(CMakeOptionSchema).optional(),
  force_find_package: z.boolean().optional(),
});

/**
 * Third-Party Dependency Entry Schema
 *
 * This schema defines the structure of a third-party dependency entry object.
 * Each third-party dependency must have a name, version, and URL. Also, it can optionally have
 * git_tag (if not provided, "main" will be used).
 */
const ThirdPartyDependencyEntrySchema = z.object({
  name: z.string().trim().min(1, 'Dependency name cannot be empty'),
  version: SemverSchema,
  git_url: GitUrlSchema,
  git_tag: GitTagSchema.optional(),
  cmake_options: z.array(CMakeOptionSchema).optional(),
  force_find_package: z.boolean().optional(),
});

/**
 * Dependencies Schema
 *
 * This schema defines the structure of a dependencies object.
 * It contains 2 sections: modules (aka first-party dependencies) and third_party.
 */
const DependenciesSchema = z.object({
  modules: z.array(ModuleDependencyEntrySchema).optional(),
  third_party: z.array(ThirdPartyDependencyEntrySchema).optional(),
});

/**
 * Project Schema
 *
 * This schema defines the structure of a project configuration object.
 */
export const ProjectSchema = z
  .object({
    $schema: z.httpUrl().trim().optional(),
    name: ProjectNameSchema,
    version: SemverSchema.optional(),
    description: ProjectDescriptionSchema.optional(),
    homepage: UrlSchema.optional(),
    languages: z.array(ProjectLanguageSchema).optional(),
    cxx_standard: ProjectCxxStandardSchema.optional(),
    license: z.string().trim().min(1, 'License cannot be empty').optional(),
    dependencies: DependenciesSchema.optional(),
  })
  .refine((data) => !data.cxx_standard || !data.languages || data.languages.includes('CXX'), {
    message: 'cxx_standard requires CXX to be listed in languages',
    path: ['cxx_standard'],
  })
  .refine(
    (data) => !data.languages || !data.languages.includes('NONE') || data.languages.length === 1,
    {
      message: 'NONE cannot be combined with other languages',
      path: ['languages'],
    },
  );

/** Project Type */
export type Project = z.infer<typeof ProjectSchema>;

/** Project JSON Schema */
export const ProjectJsonSchema = z.toJSONSchema(ProjectSchema);

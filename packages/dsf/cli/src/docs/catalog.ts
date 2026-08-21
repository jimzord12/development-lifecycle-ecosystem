export const TOPIC_ID_PATTERN = /^[a-z0-9][a-z0-9-]*(\.[a-z0-9][a-z0-9-]*)*$/;

export type CatalogTopic = {
  id: string;
  title: string;
  file: string;
  order: number;
  summary?: string;
};

export type TopicCatalog = {
  catalogVersion: 1;
  topics: CatalogTopic[];
};

export type CatalogError = {
  message: string;
};

export function parentTopicId(id: string): string | undefined {
  const separator = id.lastIndexOf('.');
  if (separator <= 0) {
    return undefined;
  }
  return id.slice(0, separator);
}

export function sortTopics(topics: readonly CatalogTopic[]): CatalogTopic[] {
  return [...topics].sort((left, right) => {
    if (left.order !== right.order) {
      return left.order - right.order;
    }
    return left.id.localeCompare(right.id);
  });
}

export function validateCatalog(
  catalog: TopicCatalog,
  existingFiles: ReadonlySet<string>,
): CatalogError[] {
  const errors: CatalogError[] = [];
  if (catalog.catalogVersion !== 1) {
    errors.push({
      message: `unsupported catalogVersion: ${String(catalog.catalogVersion)}`,
    });
  }
  if (!Array.isArray(catalog.topics)) {
    errors.push({ message: 'catalog topics must be an array' });
    return errors;
  }

  const seenIds = new Map<string, number>();
  const seenOrders = new Map<number, string>();
  const ids = new Set<string>();

  for (const topic of catalog.topics) {
    if (!TOPIC_ID_PATTERN.test(topic.id)) {
      errors.push({
        message: `topic id violates grammar: ${topic.id}`,
      });
    }
    const previousIndex = seenIds.get(topic.id);
    if (previousIndex !== undefined) {
      errors.push({
        message: `duplicate topic id: ${topic.id}`,
      });
    } else {
      seenIds.set(topic.id, 1);
      ids.add(topic.id);
    }

    const previousOrderOwner = seenOrders.get(topic.order);
    if (previousOrderOwner !== undefined) {
      errors.push({
        message: `duplicate order ${String(topic.order)} for ${previousOrderOwner} and ${topic.id}`,
      });
    } else {
      seenOrders.set(topic.order, topic.id);
    }

    if (typeof topic.title !== 'string' || topic.title.trim().length === 0) {
      errors.push({ message: `missing title for topic ${topic.id}` });
    }

    if (
      typeof topic.file !== 'string' ||
      topic.file.length === 0 ||
      topic.file.includes('/') ||
      topic.file.includes('\\') ||
      topic.file.includes('..')
    ) {
      errors.push({
        message: `invalid topic file for ${topic.id}: ${String(topic.file)}`,
      });
    } else if (!existingFiles.has(topic.file)) {
      errors.push({
        message: `missing topic file: ${topic.file}`,
      });
    }

    if (topic.summary !== undefined) {
      if (topic.summary.length === 0 || /\r|\n/.test(topic.summary)) {
        errors.push({
          message: `summary must be a single line: ${topic.id}`,
        });
      }
    }
  }

  for (const topic of catalog.topics) {
    if (!TOPIC_ID_PATTERN.test(topic.id)) {
      continue;
    }
    const parent = parentTopicId(topic.id);
    if (parent !== undefined && !ids.has(parent)) {
      errors.push({
        message: `child topic has no addressable parent: ${topic.id}`,
      });
    }
  }

  return errors;
}

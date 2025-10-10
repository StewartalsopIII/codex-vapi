import { RESERVED_AGENT_NAMES } from '@/lib/kv';

const NAME_REGEX = /^[a-z0-9-]+$/;
const MIN_NAME_LENGTH = 2;
const MAX_NAME_LENGTH = 50;

export type AgentValidationResult = {
  name: string;
  assistantId: string;
  publicKey?: string | null;
};

export function normalizeAgentName(name: string): string {
  return name.trim().toLowerCase();
}

export function validateAgentInput(input: unknown): { error?: string; value?: AgentValidationResult } {
  if (typeof input !== 'object' || input === null) {
    return { error: 'Invalid payload' };
  }

  const { name, assistantId, publicKey } = input as Record<string, unknown>;
  const nameValidation = validateAgentName(name);
  if (nameValidation.error) {
    return { error: nameValidation.error };
  }
  if (!nameValidation.value) {
    return { error: 'Invalid name' };
  }
  const nameValue = nameValidation.value;

  const assistantValidation = validateAssistantId(assistantId);
  if (assistantValidation.error) {
    return { error: assistantValidation.error };
  }
  if (!assistantValidation.value) {
    return { error: 'assistantId is required' };
  }
  const assistantValue = assistantValidation.value;

  const publicKeyValidation = validatePublicKey(publicKey);
  if (publicKeyValidation.error) {
    return { error: publicKeyValidation.error };
  }

  return {
    value: {
      name: nameValue,
      assistantId: assistantValue,
      publicKey: publicKeyValidation.value,
    },
  };
}

export function validateAgentName(name: unknown): { error?: string; value?: string } {
  if (typeof name !== 'string') {
    return { error: 'Name must be a string' };
  }

  const normalized = normalizeAgentName(name);

  if (normalized.length < MIN_NAME_LENGTH || normalized.length > MAX_NAME_LENGTH) {
    return { error: 'Name must be between 2 and 50 characters' };
  }

  if (!NAME_REGEX.test(normalized)) {
    return { error: 'Name can only include lowercase letters, numbers, and hyphens' };
  }

  if (normalized.startsWith('-') || normalized.endsWith('-')) {
    return { error: 'Name cannot start or end with a hyphen' };
  }

  if (RESERVED_AGENT_NAMES.has(normalized)) {
    return { error: 'Name is reserved' };
  }

  return { value: normalized };
}

export function validateAssistantId(value: unknown): { error?: string; value?: string } {
  if (typeof value !== 'string') {
    return { error: 'assistantId must be a string' };
  }

  const trimmed = value.trim();
  if (!trimmed) {
    return { error: 'assistantId is required' };
  }

  return { value: trimmed };
}

export function validatePublicKey(
  value: unknown
): { error?: string; value?: string | null | undefined } {
  if (value === undefined) {
    return { value: undefined };
  }

  if (value === null) {
    return { value: null };
  }

  if (typeof value !== 'string') {
    return { error: 'publicKey must be a string' };
  }

  const trimmed = value.trim();

  if (!trimmed) {
    return { value: null };
  }

  if (!trimmed.startsWith('pub_')) {
    return { error: 'publicKey must start with "pub_"' };
  }

  return { value: trimmed };
}

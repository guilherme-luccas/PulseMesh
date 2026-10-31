export function canJoinTopic(input: {
  reporterId?: string;
  identityId: string | null;
  isAdmin: boolean;
}): boolean {
  if (input.isAdmin) {
    return true;
  }

  if (!input.reporterId || !input.identityId) {
    return false;
  }

  return input.reporterId === input.identityId;
}

function assertCheck(condition: boolean, message: string): void {
  if (!condition) {
    throw new Error(message);
  }
}

export function runTopicAccessCheck(): void {
  assertCheck(
    canJoinTopic({ reporterId: 'a', identityId: 'a', isAdmin: false }) === true,
    'creator can join',
  );
  assertCheck(
    canJoinTopic({ reporterId: 'a', identityId: 'b', isAdmin: false }) === false,
    'someone else cannot join',
  );
  assertCheck(
    canJoinTopic({ reporterId: 'a', identityId: 'b', isAdmin: true }) === true,
    'admin can join any topic',
  );
  assertCheck(
    canJoinTopic({ reporterId: undefined, identityId: 'a', isAdmin: false }) === false,
    'an alert without an author does not open the conversation',
  );
}

const checkEnv = (globalThis as { process?: { env?: Record<string, string | undefined> } }).process?.env;

if (checkEnv?.PULSEMESH_CHECK === '1') {
  runTopicAccessCheck();
  console.log('topicAccess ok');
}
